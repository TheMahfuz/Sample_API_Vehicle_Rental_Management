import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    await knex('rentals').del();

    await knex('rentals').insert([
        // Spans a month boundary: Jul 29 - Aug 3 = 6 days total (rate 45 => 270.00).
        // Contributes only 3 days (Aug 1, 2, 3 => 135.00) to the August report.
        {
            vehicle_id: 1,
            customer_name: 'Alice Rahman',
            customer_phone: '+8801710000001',
            start_date: '2025-07-29',
            end_date: '2025-08-03',
            total_amount: 270.00,
            status: 'completed',
        },
        // Wholly inside August: 3 days (rate 70 => 210.00).
        {
            vehicle_id: 2,
            customer_name: 'Bob Karim',
            customer_phone: '+8801710000002',
            start_date: '2025-08-10',
            end_date: '2025-08-12',
            total_amount: 210.00,
            status: 'booked',
        },
        // Single day inside August: 1 day (rate 90 => 90.00).
        {
            vehicle_id: 3,
            customer_name: 'Chitra Das',
            customer_phone: '+8801710000003',
            start_date: '2025-08-05',
            end_date: '2025-08-05',
            total_amount: 90.00,
            status: 'ongoing',
        },
        // Cancelled rental in August - must be excluded from the report.
        {
            vehicle_id: 4,
            customer_name: 'Dilip Sen',
            customer_phone: '+8801710000004',
            start_date: '2025-08-15',
            end_date: '2025-08-20',
            total_amount: 720.00,
            status: 'cancelled',
        },
    ]);
}
