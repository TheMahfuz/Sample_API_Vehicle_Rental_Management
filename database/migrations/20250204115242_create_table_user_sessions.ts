import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user_sessions', (table) => {
        table.increments('id').primary();
        table.integer('user_id').notNullable().unsigned();
        table.string('token', 512).nullable();
        table.string('social_token', 512).nullable();
        table.string('user_agent', 512).nullable();
        table.string('ip', 256).nullable();
        table.timestamps(true, true);
        table.datetime("ended_at").nullable();

        table.index('token');
        table.foreign('user_id').references('id').inTable('staff').onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('user_sessions');
}
