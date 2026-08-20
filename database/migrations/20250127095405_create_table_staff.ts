import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('staff', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password_hash').notNullable();
        table.timestamps(true, true);

        table.index('email');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('staff');
}
