import { Express, Request, Response, NextFunction } from 'express';
import * as injectable_methods from '../app/dependencies/app.inject';

// Define a type for the injectable methods
type InjectableMethods = {
    [key: string]: (req: Request, res: Response, next: NextFunction) => void; // Adjusted to match the expected signature
};

export const useInjectableMethods = (app: Express): Express => {
    const methods = injectable_methods as unknown as InjectableMethods; // Cast to unknown first
    for (const key of Object.keys(methods)) {
        const method = methods[key];
        app.use(method);
    }
    return app;
};