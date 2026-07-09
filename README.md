# Yapinci Commerce

Next.js e-commerce platform with PostgreSQL, Prisma, NextAuth, and a full admin panel.

## Database (PostgreSQL)

This project uses a **standard PostgreSQL** database (not Prisma Dev / PGlite).

### Option A: Local PostgreSQL

1. Install PostgreSQL 17+ and create databases:

```sql
CREATE DATABASE yapinci_commerce;
CREATE DATABASE yapinci_commerce_shadow;
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Apply migrations and seed:

```bash
npm run db:migrate:deploy
npm run db:seed
```

### Option B: Docker Compose

```bash
docker compose up -d postgres postgres-shadow
npm run db:migrate:deploy
npm run db:seed
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@yapinci.az | Password123! |
| Admin | admin@yapinci.az | Password123! |
| Super Admin | superadmin@yapinci.az | Password123! |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate:deploy` | Apply migrations (production/CI) |
| `npm run db:migrate` | Create/apply migrations (development) |
| `npm run db:seed` | Seed demo data |
| `npm run db:generate` | Generate Prisma Client |
| `npm run build` | Production build |
