import { Request, Response } from 'express';
import { ApiResponse, ApiErrorResponse } from '../config/global';
import { errors } from '../config/errors';
import { getMonthlyRentalReport } from '../services/report.service';

export const rentalsReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const month = String(req.query.month);
        const vehicle_id = req.query.vehicle_id ? Number(req.query.vehicle_id) : undefined;

        const report = await getMonthlyRentalReport(month, vehicle_id);
        return ApiResponse(res, report);
    } catch (error: any) {
        return ApiErrorResponse({ res, error: errors.SOMETHING_WENT_WRONG, original_error: error });
    }
};
