import dotenv from "dotenv";
import knex from "knex";
dotenv.config();

const configurations = {
    mysql: {
        host: process.env.DB_HOST ? process.env.DB_HOST : ("127.0.0.1" as string),
        user: process.env.DB_USER ? process.env.DB_USER : ("" as string),
        password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : ("" as string),
        database: process.env.DB_NAME ? process.env.DB_NAME : ("" as string),
    },
};

const knex_config = {
    client: "mysql2",
    connection: configurations.mysql,
    migrations: {
        directory: "./database/migrations",
    },
    seeds: {
        directory: "./database/seeds",
    },
};

const instance = knex({
    client: "mysql2",
    connection: {
        ...configurations.mysql,
        typeCast: function (field: any, next: Function) {
            if (field.type === "DATETIME" || field.type === "TIMESTAMP") {
                return new Date(field.string()).valueOf();
            }
            if (field.type === "DATE") {
                return field.string();
            }
            return next();
        },
    },
});

export { knex_config, instance };
