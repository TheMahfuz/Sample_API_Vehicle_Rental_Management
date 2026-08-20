import { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { ApiResponse, ApiErrorResponse } from '../config/global';
import { errors } from '../config/errors';
import Vehicle from '../models/vehicle.model';
import { toPublicPath } from '../middleware/upload';

const duplicateErrorCodes = new Set(['ER_DUP_ENTRY', '23505', 'SQLITE_CONSTRAINT']);

// Remove an uploaded file (best-effort) given its stored public path
const removeFile = (publicPath?: string | null): void => {
    if (!publicPath) return;
    const abs = path.resolve(process.cwd(), publicPath);
    fs.promises.unlink(abs).catch(() => { /* ignore */ });
};

export const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const { category, search } = req.query as { category?: string; search?: string };

        const query = Vehicle.qb().select(Vehicle.select).orderBy('vehicles.id', 'desc');
        if (category) query.where('vehicles.category', category);
        if (search) query.whereLike('vehicles.name', `%${search}%`);

        const result = await Vehicle.paginate(page, limit, query);
        return ApiResponse(res, result);
    } catch (error: any) {
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await Vehicle.find({ id: req.params.id });
        if (!vehicle) return ApiErrorResponse({ res, error: errors.DATA_NOT_FOUND, custom_message: 'Vehicle not found.' });
        return ApiResponse(res, vehicle);
    } catch (error: any) {
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};

export const create = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, plate_number, category, daily_rate } = req.body;
        const photo_path = req.file ? toPublicPath(req.file.filename) : null;

        const [id] = await Vehicle.save({ name, plate_number, category, daily_rate, photo_path });
        const vehicle = await Vehicle.find({ id });
        return ApiResponse(res, vehicle);
    } catch (error: any) {
        if (req.file) removeFile(toPublicPath(req.file.filename));
        if (duplicateErrorCodes.has(error.code)) {
            return ApiErrorResponse({ res, error: errors.DUPLICATE_ENTRY, custom_message: 'A vehicle with this plate number already exists.' });
        }
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};

export const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existing = await Vehicle.find({ id });
        if (!existing) {
            if (req.file) removeFile(toPublicPath(req.file.filename));
            return ApiErrorResponse({ res, error: errors.DATA_NOT_FOUND, custom_message: 'Vehicle not found.' });
        }

        const { name, plate_number, category, daily_rate } = req.body;
        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name;
        if (plate_number !== undefined) updateData.plate_number = plate_number;
        if (category !== undefined) updateData.category = category;
        if (daily_rate !== undefined) updateData.daily_rate = daily_rate;
        if (req.file) updateData.photo_path = toPublicPath(req.file.filename);

        await Vehicle.update({ id }, updateData);

        // Remove the previous photo only after a successful update
        if (req.file && existing.photo_path) removeFile(existing.photo_path);

        const vehicle = await Vehicle.find({ id });
        return ApiResponse(res, vehicle);
    } catch (error: any) {
        if (req.file) removeFile(toPublicPath(req.file.filename));
        if (duplicateErrorCodes.has(error.code)) {
            return ApiErrorResponse({ res, error: errors.DUPLICATE_ENTRY, custom_message: 'A vehicle with this plate number already exists.' });
        }
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existing = await Vehicle.find({ id });
        if (!existing) return ApiErrorResponse({ res, error: errors.DATA_NOT_FOUND, custom_message: 'Vehicle not found.' });

        await Vehicle.delete({ id });
        return ApiResponse(res, { message: 'Vehicle deleted successfully' });
    } catch (error: any) {
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};
