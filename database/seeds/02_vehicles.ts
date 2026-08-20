import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Rentals reference vehicles, so clear rentals before re-seeding vehicles.
    await knex('rentals').del();
    await knex('vehicles').del();

    await knex('vehicles').insert([
        { id: 1, name: 'Toyota Corolla', plate_number: 'DHK-1001', category: 'sedan', daily_rate: 45.00, photo_path: null },
        { id: 2, name: 'Honda CR-V', plate_number: 'DHK-1002', category: 'suv', daily_rate: 70.00, photo_path: null },
        { id: 3, name: 'Ford Transit', plate_number: 'DHK-1003', category: 'van', daily_rate: 90.00, photo_path: null },
        { id: 4, name: 'Tesla Model 3', plate_number: 'DHK-1004', category: 'electric', daily_rate: 120.00, photo_path: null },
    ]);
}
