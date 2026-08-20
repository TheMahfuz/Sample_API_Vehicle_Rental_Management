# Vehicle Rental Management API

A small REST API for a vehicle rental company. Staff log in and manage the vehicle fleet; customer bookings are recorded as rentals. A vehicle cannot be booked twice for overlapping dates, and the API provides a monthly report of rental activity per vehicle.

Built on Node.js + TypeScript + Express 5, with MySQL via Knex, JWT authentication, Joi validation, and an MVC + OOP model architecture.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Setup & Run](#setup--run)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
- [Project Structure](#project-structure)

## Tech Stack
- Express 5, TypeScript
- MySQL (via Knex query builder + migrations/seeds)
- JWT (`jsonwebtoken`) + Passport local strategy
- Joi for request validation
- Multer for vehicle photo uploads
- Winston logging, express-rate-limit

## Requirements
- Node.js v16.8+ and npm
- A running MySQL server

## Setup & Run
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Create your env file from the example and fill in the values (especially the DB and JWT settings):
   ```bash
   cp .env.example .env
   ```
3. Create an empty database matching `DB_NAME` in your `.env`.
4. Run the migrations to build the schema:
   ```bash
   npm run migrate
   ```
5. Seed sample data (staff, vehicles, and rentals including one spanning a month boundary):
   ```bash
   npm run seed
   ```
6. Start the server:
   ```bash
   npm run dev          # development (ts-node-dev)
   # or
   npm run build && npm start   # production build
   ```

The server runs on `http://localhost:<PORT>` (default `3000`). Uploaded photos are served from `/<UPLOAD_DIR>` (default `/uploads`).

Seeded staff credentials: `admin@rental.test` / `password123`.

### Useful scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start in dev mode with reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run migrate` | Run latest migrations |
| `npm run rollback` | Roll back the last migration batch |
| `npm run seed` | Run all seeds |
| `npm run migrate:create -- <name>` | Scaffold a migration |
| `npm run seed:create -- <name>` | Scaffold a seed |

## Environment Variables
See [.env.example](.env.example). Key variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 3000) |
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL connection |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRATION` | Token lifetime in seconds |
| `UPLOAD_DIR` | Directory for uploaded vehicle photos (default `uploads`) |

## Database Schema
- **staff**: `id`, `name`, `email` (unique), `password_hash`, `created_at`, `updated_at`
- **vehicles**: `id`, `name`, `plate_number` (unique), `category`, `daily_rate`, `photo_path` (nullable), `deleted_at` (nullable, soft delete), `created_at`, `updated_at`
- **rentals**: `id`, `vehicle_id` (FK), `customer_name`, `customer_phone`, `start_date`, `end_date`, `total_amount`, `status` (`booked`/`ongoing`/`completed`/`cancelled`, default `booked`), `created_at`, `updated_at`
- **user_sessions**: JWT session records (FK to `staff`)

## Authentication
- `POST /auth/login` with `email` + `password` returns a JWT.
- All `/vehicles`, `/rentals`, and `/reports` routes require `Authorization: Bearer <token>`.
- Login is rate-limited (10 attempts/minute/IP).

## API Endpoints

### Auth (`/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Log in, returns JWT |
| POST | `/auth/refresh-token` | Yes | Refresh the JWT |
| POST | `/auth/logout` | Yes | Invalidate the current session |

Sample request bodies:

- `POST /auth/login`

```json
{
  "email": "admin@rental.test",
  "password": "password123"
}
```

- `POST /auth/refresh-token` — N/A (send `Authorization: Bearer <token>` header, no body)
- `POST /auth/logout` — N/A (send `Authorization: Bearer <token>` header, no body)

### Vehicles (`/vehicles`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/vehicles` | Yes | List with `page`, `limit`, `category`, `search` (by name) |
| GET | `/vehicles/:id` | Yes | Get a single vehicle |
| POST | `/vehicles` | Yes | Create (multipart/form-data, `photo` field for image) |
| PUT | `/vehicles/:id` | Yes | Update (multipart, replaces photo if provided) |
| DELETE | `/vehicles/:id` | Yes | Soft delete |

Sample request bodies:

- `GET /vehicles` — N/A (query params only, e.g. `?page=1&limit=10&category=suv&search=honda`)
- `GET /vehicles/:id` — N/A
- `POST /vehicles` — `multipart/form-data` fields (all as form fields; `photo` is an optional image file):

```
name:          Toyota Corolla
plate_number:  DHK-1001
category:      sedan
daily_rate:    45.00
photo:         <image file>   (optional)
```

- `PUT /vehicles/:id` — `multipart/form-data`, all fields optional; include `photo` to replace the existing image:

```
name:          Toyota Corolla Altis
category:      sedan
daily_rate:    50.00
photo:         <image file>   (optional)
```

- `DELETE /vehicles/:id` — N/A

### Rentals (`/rentals`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/rentals` | Yes | List with `page`, `limit`, `vehicle_id`, `status`, `date_from`, `date_to`, `search` |
| GET | `/rentals/:id` | Yes | Get a single rental |
| POST | `/rentals` | Yes | Create; returns `409` on overlapping active rental |
| PUT | `/rentals/:id` | Yes | Update; re-checks overlap when dates/vehicle change |
| DELETE | `/rentals/:id` | Yes | Delete |

Sample request bodies:

- `GET /rentals` — N/A (query params only, e.g. `?page=1&limit=10&vehicle_id=1&status=booked&date_from=2025-08-01&date_to=2025-08-31&search=alice`)
- `GET /rentals/:id` — N/A
- `POST /rentals` (`total_amount` is calculated server-side; `status` is optional, defaults to `booked`):

```json
{
  "vehicle_id": 1,
  "customer_name": "Alice Rahman",
  "customer_phone": "+8801710000001",
  "start_date": "2025-08-10",
  "end_date": "2025-08-12"
}
```

- `PUT /rentals/:id` — all fields optional; date/vehicle changes re-trigger the overlap check and recalculate `total_amount`:

```json
{
  "start_date": "2025-08-11",
  "end_date": "2025-08-14",
  "status": "ongoing"
}
```

- `DELETE /rentals/:id` — N/A

### Reports (`/reports`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports/rentals?month=YYYY-MM` | Yes | Monthly report; optional `&vehicle_id=` |

Sample request:

- `GET /reports/rentals` — N/A (query params only, e.g. `?month=2025-08` or `?month=2025-08&vehicle_id=1`)

Report returns, per vehicle: `id`, `name`, `total_bookings`, `days_rented`, `revenue`, plus the `top_vehicle` (highest revenue that month).

## Business Rules
- **total_amount** is computed server-side as `daily_rate x number of days`, inclusive of both start and end dates (same start/end date = 1 day).
- **Overlap / double-booking**: two rentals conflict only if they are for the same vehicle, both active (`booked` or `ongoing`), and their date ranges overlap (`existing.start_date <= new.end_date AND existing.end_date >= new.start_date`). The check runs on both create and update.
- **Concurrency**: the availability check and insert run inside a transaction using `SELECT ... FOR UPDATE`, so two staff booking the same vehicle at the same moment cannot both succeed.
- **Monthly report** only counts the portion of each rental that falls inside the requested month via clamped dates: `DATEDIFF(LEAST(end_date, month_end), GREATEST(start_date, month_start)) + 1`. A rental running Jul 29 - Aug 3 contributes 3 days to the August report, not 6. Cancelled rentals are excluded.

## Project Structure
```
app/
  config/       app constants, DB config, error catalog, response helpers
  controllers/  staff, vehicle, rental, report handlers
  core/         base Model (Knex wrapper with transactions, pagination, soft delete)
  middleware/   auth (JWT), validate (Joi), upload (multer)
  models/       staff, vehicle, rental, user_sessions
  routes/       auth, vehicles, rentals, reports (+ web, api)
  services/     auth, rental (overlap/transaction), report (monthly query)
  validators/   Joi schemas per resource
database/
  migrations/   staff, user_sessions, vehicles, rentals
  seeds/        01_staff, 02_vehicles, 03_rentals
```
