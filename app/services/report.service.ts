import Rental from '../models/rental.model';

export interface VehicleReportRow {
    id: number;
    name: string;
    total_bookings: number;
    days_rented: number;
    revenue: number;
}

export interface MonthlyRentalReport {
    month: string;
    month_start: string;
    month_end: string;
    vehicles: VehicleReportRow[];
    top_vehicle: VehicleReportRow | null;
}

// Returns { month_start: 'YYYY-MM-01', month_end: 'YYYY-MM-<lastDay>' }
const getMonthBounds = (month: string): { month_start: string; month_end: string } => {
    const [year, mon] = month.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, mon, 0)).getUTCDate();
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        month_start: `${year}-${pad(mon)}-01`,
        month_end: `${year}-${pad(mon)}-${pad(lastDay)}`,
    };
};

/**
 * Monthly rental report per vehicle. Only the portion of each rental that falls
 * inside the requested month is counted, using clamped dates:
 *   overlap_days = DATEDIFF(LEAST(end_date, month_end), GREATEST(start_date, month_start)) + 1
 * Cancelled rentals are excluded. A rental running Jul 29 - Aug 3 contributes 3
 * days to the August report (Aug 1, 2, 3), not 6.
 */
export const getMonthlyRentalReport = async (month: string, vehicle_id?: number): Promise<MonthlyRentalReport> => {
    const { month_start, month_end } = getMonthBounds(month);
    const db = Rental.db;

    const query = Rental.qb()
        .join('vehicles', 'vehicles.id', 'rentals.vehicle_id')
        .whereNull('vehicles.deleted_at')
        .whereNot('rentals.status', 'cancelled')
        .where('rentals.start_date', '<=', month_end)
        .where('rentals.end_date', '>=', month_start)
        .groupBy('vehicles.id', 'vehicles.name')
        .orderBy('revenue', 'desc')
        .select(
            'vehicles.id as id',
            'vehicles.name as name',
            db.raw('COUNT(rentals.id) as total_bookings'),
            db.raw('COALESCE(SUM(DATEDIFF(LEAST(rentals.end_date, ?), GREATEST(rentals.start_date, ?)) + 1), 0) as days_rented', [month_end, month_start]),
            db.raw('COALESCE(SUM((DATEDIFF(LEAST(rentals.end_date, ?), GREATEST(rentals.start_date, ?)) + 1) * vehicles.daily_rate), 0) as revenue', [month_end, month_start]),
        );

    if (vehicle_id) query.where('vehicles.id', vehicle_id);

    const rows = await query;

    const vehicles: VehicleReportRow[] = rows.map((row: any) => ({
        id: Number(row.id),
        name: row.name,
        total_bookings: Number(row.total_bookings),
        days_rented: Number(row.days_rented),
        revenue: Number(row.revenue),
    }));

    const top_vehicle = vehicles.length > 0
        ? vehicles.reduce((max, cur) => (cur.revenue > max.revenue ? cur : max), vehicles[0])
        : null;

    return { month, month_start, month_end, vehicles, top_vehicle };
};
