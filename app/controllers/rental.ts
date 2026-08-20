import { Request, Response } from 'express';
import { ApiResponse, ApiErrorResponse } from '../config/global';
import { errors } from '../config/errors';
import Rental from '../models/rental.model';
import { createRental, updateRental } from '../services/rental.service';

const handleServiceError = (res: Response, error: any) => {
    if (error?.error_code && errors[error.error_code]) {
        return ApiErrorResponse({ res, error: errors[error.error_code], custom_message: error.custom_message || null });
    }
    return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
};

export const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const { vehicle_id, status, date_from, date_to, search } = req.query as Record<string, string>;

        const query = Rental.qb().select(Rental.select).orderBy('rentals.id', 'desc');
        if (vehicle_id) query.where('rentals.vehicle_id', vehicle_id);
        if (status) query.where('rentals.status', status);
        if (date_from) query.where('rentals.end_date', '>=', date_from);
        if (date_to) query.where('rentals.start_date', '<=', date_to);
        if (search) query.whereLike('rentals.customer_name', `%${search}%`);

        const result = await Rental.paginate(page, limit, query);
        return ApiResponse(res, result);
    } catch (error: any) {
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const rental = await Rental.find({ id: req.params.id });
        if (!rental) return ApiErrorResponse({ res, error: errors.DATA_NOT_FOUND, custom_message: 'Rental not found.' });
        return ApiResponse(res, rental);
    } catch (error: any) {
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vehicle_id, customer_name, customer_phone, start_date, end_date, status } = req.body;
        const rental = await createRental({ vehicle_id, customer_name, customer_phone, start_date, end_date, status });
        return ApiResponse(res, rental);
    } catch (error: any) {
        return handleServiceError(res, error);
    }
};

export const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const { vehicle_id, customer_name, customer_phone, start_date, end_date, status } = req.body;
        const rental = await updateRental(Number(req.params.id), { vehicle_id, customer_name, customer_phone, start_date, end_date, status });
        return ApiResponse(res, rental);
    } catch (error: any) {
        return handleServiceError(res, error);
    }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existing = await Rental.find({ id });
        if (!existing) return ApiErrorResponse({ res, error: errors.DATA_NOT_FOUND, custom_message: 'Rental not found.' });

        await Rental.delete({ id });
        return ApiResponse(res, { message: 'Rental deleted successfully' });
    } catch (error: any) {
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};
