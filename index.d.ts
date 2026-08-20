declare namespace Express {
    export interface Request {
        request_id?: string;
        user?: {
            id: number;
            email: string;
        };
    }
}
