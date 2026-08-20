import { Request, Response } from 'express';
import { ApiResponse } from '../config/global'; // Adjust the path as necessary

export const home = (req: Request, res: Response) => {
    return ApiResponse(res, `Welcome to the ${process.env.APP_NAME || "backend app"}!`)
};