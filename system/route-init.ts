import { Express } from 'express';
import fs from 'node:fs';
import path from 'node:path';
const routes_dir = path.join(__dirname, '../app/routes');
import { ApiErrorResponse } from '../app/config/global';

export default (app: Express): Express => {

    const loadRoutes = (dir: string) => {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                loadRoutes(fullPath);
            } else if (file.endsWith('.ts') || file.endsWith('.js')) {
                const { default: router, prefix } = require(fullPath);
                let routePrefix = prefix || '/';
                if (!routePrefix.startsWith('/')) routePrefix = '/' + routePrefix;
                if (!routePrefix.endsWith('/')) routePrefix += '/';
                app.use(routePrefix, router);
            }
        });
    };

    loadRoutes(routes_dir);

    // if route not found
    app.use((req, res, next) => {
        try {
            const request_path = req.path;
            const path_parts = request_path.split('/').filter(Boolean);
            const [controller_path, req_method_name, id] = path_parts;
            const to_camel_case = (str: string): string => {
                return str.includes('-') ? str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : str;
            };
            const method_name = to_camel_case(req_method_name);

            const controller = require(`../../app/controllers/${controller_path}`);
            if (controller && typeof controller[method_name] === 'function') {
                if (id) req.params["id"] = id;
                return controller[method_name](req, res, next);
            } else throw new Error("NOT_FOUND")
        } catch (error) {
            return ApiErrorResponse({ res, error_code: "NOT_FOUND" });
        }

    });
    return app;
}