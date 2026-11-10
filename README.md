# Back-end Test Vista

Open http://localhost:3000 for a home page with clickable links to the API.

REST API for managing companies and their services.

**Tech stack:** Node.js, TypeScript, Express.js, Prisma ORM, MySQL

## Prerequisites

- Node.js 18 or newer
- MySQL server running locally (for example via XAMPP)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file by copying `.env.example` to `.env`, then set your database connection:

   ```
   DATABASE_URL="mysql://user:password@localhost:3306/vista_test"
   PORT=3000
   ```

   With XAMPP's default MySQL there is no password, so the URL is
   `mysql://root:@localhost:3306/vista_test`.

3. Generate the Prisma client and create the database tables:

   ```bash
   npx prisma migrate dev
   ```

## Run

Development (auto-restart on changes):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

The API runs at http://localhost:3000

## Endpoints

| Method | Path            | Description                         | Success |
|--------|-----------------|-------------------------------------|---------|
| POST   | `/companies`    | Create a new company                | 201     |
| GET    | `/companies`    | List all companies with services    | 200     |
| POST   | `/services`     | Create a service under a company    | 201     |
| GET    | `/services/:id` | Get service details by ID           | 200     |

### Request bodies

**POST /companies**

```json
{
  "name": "Vista Tech",
  "registrationNumber": "REG-001"
}
```

**POST /services**

```json
{
  "companyId": 1,
  "name": "Web Development",
  "description": "Custom website builds",
  "price": 1500
}
```

### Error responses

| Status | Meaning                                                      |
|--------|--------------------------------------------------------------|
| 400    | Validation failed (empty field, invalid id, non-numeric price) |
| 404    | Company or service not found                                 |
| 409    | Registration number already exists                           |
| 500    | Internal server error                                        |

## API documentation

Import `postman_collection.json` (in the project root) into Postman to try all endpoints.

## Features

- TypeScript interfaces for request and response DTOs
- Input validation with express-validator
- Request logging middleware (method, path and timestamp)
- Centralised error handling with proper HTTP status codes
- Prisma schema with a one-to-many relation (Company has many Services)

## Project

## Run with Docker

Requires Docker Desktop. This starts MySQL and the API together and applies the migrations automatically:

```bash
docker compose up --build
```

The API runs at http://localhost:3000. Stop it with `Ctrl + C`, or `docker compose down`.
(Stop any local `npm run dev` first, since both use port 3000.)