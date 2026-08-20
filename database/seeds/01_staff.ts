import type { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
    // Clear child tables first to satisfy foreign keys, then staff.
    await knex('rentals').del();
    await knex('user_sessions').del();
    await knex('staff').del();

    const password_hash = await bcrypt.hash('password123', 10);

    await knex('staff').insert([
        { id: 1, name: 'Admin Staff', email: 'admin@rental.test', password_hash },
        { id: 2, name: 'Front Desk', email: 'desk@rental.test', password_hash },
    ]);
}
