# Pharmacy E-commerce — REST API

Backend for a full-stack pharmacy e-commerce application. Provides a RESTful API for product catalogue, user authentication, order management, and PayPal payment processing.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 22 |
| Framework | Express 5 |
| Language | TypeScript (strict mode) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` |
| Validation | Zod |
| Security | Helmet + CORS |
| Payments | PayPal Server SDK |
| Testing | Vitest + Supertest |

## Architecture

The project follows a layered architecture with clear separation of concerns:

```
src/
├── index.ts           # Entry point — starts the HTTP server
├── app.ts             # Express app setup (middleware, routes, error handler)
├── controllers/       # Request/response handling (thin layer, delegates to services)
├── routes/            # Express routers — define endpoints and apply middleware
├── services/          # Business logic (auth, products, orders, customer, PayPal)
├── middlewares/       # Auth guard (verifyToken), global error handler
├── lib/               # Shared utilities: Prisma client, env validation, JWT helpers
└── types/             # Shared TypeScript types and Zod schemas
prisma/
├── schema.prisma      # Database models
├── seed.ts            # Sample data (5 categories, 15 products)
└── migrations/        # SQL migration history
```

**Key decisions:**
- Controllers are intentionally thin — they parse the request, call a service, and send the response. Business logic lives in services.
- Environment variables are validated at startup via `src/lib/env.ts`. The server will not start if any required variable is missing.
- All secrets (JWT, PayPal credentials) are read from environment variables — never hardcoded.
- Zod schemas are co-located with their domain types for single-source validation.

## Database Schema

```
User ──< Order ──< OrderItem >── Product >── Category
  │
  └── BillingAddress

Order ──── ShippingAddress
```

**Order statuses:** `PENDING` → `PAID` → `SHIPPED` → `DELIVERED` (or `CANCELLED`)

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Log in (returns JWT cookie) |
| POST | `/api/auth/logout` | — | Clear session cookie |

### Products & Categories
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | — | List products (query: `search`, `category`, `minPrice`, `maxPrice`) |
| GET | `/api/products/featured` | — | Featured products |
| GET | `/api/products/:slug` | — | Single product by slug |
| GET | `/api/categories` | — | All categories |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | optional | Create order + PayPal order |
| POST | `/api/orders/:id/capture` | optional | Capture PayPal payment |
| GET | `/api/orders` | required | Authenticated user's orders |
| GET | `/api/orders/:id` | required | Order detail |

### Customer
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/customer/profile` | required | Get profile |
| PUT | `/api/customer/profile` | required | Update profile |
| GET | `/api/customer/billing-address` | required | Get billing address |
| PUT | `/api/customer/billing-address` | required | Save billing address |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Returns `{ status: "ok" }` |

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL

### Setup

```bash
# Install dependencies
npm install

# Create the database
createdb farmacia_db

# Copy and fill in environment variables
cp .env.example .env
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (e.g. `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PAYPAL_CLIENT_ID` | PayPal application client ID |
| `PAYPAL_SECRET` | PayPal application secret |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:5173`) |

> **Mock payment mode:** Set `PAYPAL_CLIENT_ID=test_paypal_client_id` to skip real PayPal API calls. The server will return mock order IDs so the full checkout flow can be tested without PayPal credentials.

### Database

```bash
# Run migrations
npx prisma migrate deploy

# Seed sample data (5 categories + 15 products)
npm run seed
```

### Development

```bash
npm run dev     # Start with hot reload (ts-node-dev)
```

Server starts on `http://localhost:4000`.

## Running Tests

```bash
npm test          # Run once
npm run test:watch  # Watch mode
```

Tests use **Vitest + Supertest** and cover all route handlers. Each router has a corresponding `*.test.ts` file co-located alongside it.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output (production) |
| `npm test` | Run test suite |
| `npm run seed` | Load sample data into the database |

## Security

- Passwords hashed with `bcrypt` (10 salt rounds)
- JWT tokens delivered via HTTP-only cookies (`withCredentials` on frontend)
- `helmet` sets secure HTTP headers
- CORS restricted to the configured `FRONTEND_URL`
- No secrets in source code — all read from environment variables at runtime
- Input validated with Zod before reaching the database
