import { Express } from 'express';
import { useInjectableMethods } from './injector';
import initRoutes from './route-init';
import { logOnRequest, setRequestId } from './request'
import { logger } from './logger'
import {
    IS_REQUEST_LOG_ENABLED
} from '../app/config/config';

export const bootstrap = (app: Express): Express => {
    app.use(setRequestId);
    if (IS_REQUEST_LOG_ENABLED) app.use(logOnRequest);
    app = useInjectableMethods(app);
    app = initRoutes(app);
    return app;
};

// Example of calling the logger
// logger.info('This is an info log message.');
// logger.error('This is an error log message.');
// logger.warn('This is a warning log message.');
export { logger };
