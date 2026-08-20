import { knex_config } from "./app/config/database";

const knexConfig = {
    development: knex_config,
    production: knex_config,
    test: knex_config
};

export default knexConfig;