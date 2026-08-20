import Rental from '../models/rental.model';
import Vehicle from '../models/vehicle.model';

// Rentals in these statuses block the vehicle for overlapping dates.
export const ACTIVE_STATUSES = ['booked', 'ongoing'];

interface ServiceError {
    error_code: string;
    custom_message?: string;
}

const serviceError = (error_code: string, custom_message?: string): ServiceError => ({ error_code, custom_message });

/**
 * Number of days a rental covers, inclusive of both start and end dates.
 * Same start/end date counts as 1 day.
 */
export const daysInclusive = (start_date: string, end_date: string): number => {
    const start = new Date(`${start_date}T00:00:00Z`).getTime();
    const end = new Date(`${end_date}T00:00:00Z`).getTime();
    return Math.floor((end - start) / 86400000) + 1;
};

export const calcTotalAmount = (daily_rate: number | string, start_date: string, end_date: string): number => {
    const rate = typeof daily_rate === 'string' ? Number.parseFloat(daily_rate) : daily_rate;
    return Number((rate * daysInclusive(start_date, end_date)).toFixed(2));
};

/**
 * Find an active rental for the given vehicle whose date range overlaps
 * [start_date, end_date]. Two ranges overlap when
 * existing.start_date <= new.end_date AND existing.end_date >= new.start_date.
 *
 * Runs inside the provided transaction with a row lock (FOR UPDATE) so that
 * concurrent bookings for the same vehicle are serialized.
 */
const findOverlap = (trx: any, vehicle_id: number, start_date: string, end_date: string, excludeId?: number) => {
    const query = Rental.qb()
        .transacting(trx)
        .forUpdate()
        .where('vehicle_id', vehicle_id)
        .whereIn('status', ACTIVE_STATUSES)
        .where('start_date', '<=', end_date)
        .where('end_date', '>=', start_date);
    if (excludeId) query.whereNot('id', excludeId);
    return query.first();
};

export interface CreateRentalPayload {
    vehicle_id: number;
    customer_name: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
    status?: string;
}

export const createRental = async (payload: CreateRentalPayload) => {
    const vehicle = await Vehicle.find({ id: payload.vehicle_id });
    if (!vehicle) throw serviceError('DATA_NOT_FOUND', 'Vehicle not found.');

    const total_amount = calcTotalAmount(vehicle.daily_rate, payload.start_date, payload.end_date);

    const id = await Rental.transaction(async (trx) => {
        const conflict = await findOverlap(trx, payload.vehicle_id, payload.start_date, payload.end_date);
        if (conflict) throw serviceError('RENTAL_CONFLICT');

        const [insertId] = await Rental.save({
            vehicle_id: payload.vehicle_id,
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            start_date: payload.start_date,
            end_date: payload.end_date,
            total_amount,
            status: payload.status ?? 'booked',
        }, trx);
        return insertId;
    });

    return Rental.find({ id });
};

export interface UpdateRentalPayload {
    vehicle_id?: number;
    customer_name?: string;
    customer_phone?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
}

export const updateRental = async (id: number, payload: UpdateRentalPayload) => {
    const existing = await Rental.find({ id });
    if (!existing) throw serviceError('DATA_NOT_FOUND', 'Rental not found.');

    const vehicle_id = payload.vehicle_id ?? existing.vehicle_id;
    const start_date = payload.start_date ?? existing.start_date;
    const end_date = payload.end_date ?? existing.end_date;
    const status = payload.status ?? existing.status;

    const datesOrVehicleChanged =
        (payload.vehicle_id !== undefined && payload.vehicle_id !== existing.vehicle_id) ||
        (payload.start_date !== undefined && payload.start_date !== existing.start_date) ||
        (payload.end_date !== undefined && payload.end_date !== existing.end_date);

    const vehicle = await Vehicle.find({ id: vehicle_id });
    if (!vehicle) throw serviceError('DATA_NOT_FOUND', 'Vehicle not found.');

    const updateData: Record<string, any> = {};
    if (payload.customer_name !== undefined) updateData.customer_name = payload.customer_name;
    if (payload.customer_phone !== undefined) updateData.customer_phone = payload.customer_phone;
    if (payload.vehicle_id !== undefined) updateData.vehicle_id = payload.vehicle_id;
    if (payload.start_date !== undefined) updateData.start_date = payload.start_date;
    if (payload.end_date !== undefined) updateData.end_date = payload.end_date;
    if (payload.status !== undefined) updateData.status = payload.status;

    // Recompute total when the dates or vehicle changed.
    if (datesOrVehicleChanged) {
        updateData.total_amount = calcTotalAmount(vehicle.daily_rate, start_date, end_date);
    }

    await Rental.transaction(async (trx) => {
        // Re-run the overlap check when dates/vehicle change and the rental stays active.
        if (datesOrVehicleChanged && ACTIVE_STATUSES.includes(status)) {
            const conflict = await findOverlap(trx, vehicle_id, start_date, end_date, id);
            if (conflict) throw serviceError('RENTAL_CONFLICT');
        }
        if (Object.keys(updateData).length > 0) {
            await Rental.update({ id }, updateData, trx);
        }
    });

    return Rental.find({ id });
};
