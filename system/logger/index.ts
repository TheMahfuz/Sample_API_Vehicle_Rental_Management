import { Request } from 'express';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { utils } from './utils';

const { combine, timestamp, printf } = format;

// Define the type for the printf function parameters
interface LogFormat {
    level: string;
    label?: string;
    message: string;
    data?: any; // You can specify a more specific type if known
    timestamp: string;
    request_id?: string;
}

const myFormat = printf((info: any) => { // Use 'any' to avoid type issues
    const { level, label, message, data, timestamp, request_id } = info as LogFormat; // Type assertion
    return JSON.stringify([{
        level, timestamp, request_id, label, message, data
    }]);
});

export const logger = createLogger({
    level: process.env.LOG_LEVEL ?? 'silly',
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    },
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: 'application-%DATE%.log',
            dirname: 'logs',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '45d'
        })
    ]
});

const request_logger = createLogger({
    level: 'request',
    levels: {
        request: 0
    },
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: 'request-%DATE%.log',
            dirname: 'logs',
            level: 'request',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '45d'
        })
    ]
});

export const requestlog = (req: Request): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        try {
            let body = { ...req.body };
            body = utils.removeSecret(body);
            let request_id = req.request_id;

            let data = {
                path: req.path,
                params: JSON.stringify(req.params),
                query_params: JSON.stringify(req.query),
                body: JSON.stringify(body),
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                "user-agent": req.get('user-agent')
            };

            // Add a message property to the log entry
            request_logger.log({
                level: 'request',
                message: `${req.path}`, // Add a relevant message
                data,
                request_id
            });
            return resolve(true);
        } catch (err) {
            console.log('err');
            return reject(new Error(`Logging request failed at ${new Date().valueOf()}: ${err}`));
        }
    });
};
