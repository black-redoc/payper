# D1 (Cloudflare Database) Setup

This project is configured to use **Cloudflare D1 for both development and production**.

## Architecture

- **Local Development**: D1 Local (`.wrangler/state/v3/d1`)
- **Production**: D1 Remote (Cloudflare serverless database)
- Both environments use the same D1 adapter with Prisma
- No SQLite files needed - everything runs through D1

## Prerequisites

1. Have a Cloudflare account
2. Have `wrangler` CLI installed
3. Be authenticated to Cloudflare: `npx wrangler login`

## Setup Steps

### 1. Create the D1 Database

```bash
# Create the database in Cloudflare
npx wrangler d1 create payper-db
```

This command will return information like:

```
✅ Successfully created DB 'payper-db' in region WEUR
Created your database using D1's new storage backend.

[[d1_databases]]
binding = "DB"
database_name = "payper-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update wrangler.jsonc

Copy the `database_id` you obtained and update the `wrangler.jsonc` file:

```jsonc
{
  // ... rest of configuration
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "payper-db",
      "database_id": "PASTE_YOUR_DATABASE_ID_HERE",
    },
  ],
}
```

### 3. Create and Apply Migrations

This project uses a hybrid approach:

- **Prisma migrations** for local SQLite development (`prisma/migrations/`)
- **D1 migrations** for Cloudflare production (`migrations/`)

#### Initial Setup (Already Done)

The initial migration has been created and applied locally. If you need to set it up from scratch:

```bash
# 1. Create migrations directory
mkdir -p migrations

# 2. Copy Prisma migration to D1 format
cp prisma/migrations/20251117183050_init/migration.sql migrations/0001_initial_schema.sql

# 3. Apply migrations locally
npm run d1:migrate:local

# 4. Apply migrations to production
npm run d1:migrate:remote
```

#### Verify Local Setup

```bash
# List all tables in local D1 database
npx wrangler d1 execute eltallerdelprofe --local --command "SELECT name FROM sqlite_master WHERE type='table';"

# You should see: Client, Company, Invoice, InvoiceItem, Note
```

### 4. Future Migrations

When you make changes to the Prisma schema:

```bash
# 1. Create Prisma migration (for local SQLite)
npm run db:migrate

# 2. Copy the new migration to D1 format
# Find the latest migration in prisma/migrations/ and copy it:
cp prisma/migrations/XXXXXXXXX_migration_name/migration.sql migrations/000X_migration_name.sql

# 3. Apply to local D1
npm run d1:migrate:local

# 4. Apply to production D1
npm run d1:migrate:remote
```

#### Alternative: Generate migration directly for D1

```bash
# Generate SQL diff from current D1 state
npm run d1:migrate:generate > migrations/000X_migration_name.sql

# Apply locally
npm run d1:migrate:local

# Apply to production
npm run d1:migrate:remote
```

## Verify Configuration

### Local Development

```bash
# Start development server (uses local D1)
npm run dev
```

The application will connect to the local D1 database in `.wrangler/state/v3/d1`.

### Production (Preview)

```bash
# Build and preview with local D1
npm run preview
```

This also uses local D1 database but in a production-like environment.

### Production (Deploy)

```bash
# Deploy to Cloudflare (uses remote D1)
npm run deploy
```

This will use the remote D1 database configured in Cloudflare.

## Query the D1 Database

### Locally

```bash
npx wrangler d1 execute payper-db --local --command "SELECT * FROM Company LIMIT 10"
```

### In Production

```bash
npx wrangler d1 execute payper-db --remote --command "SELECT * FROM Company LIMIT 10"
```

## Useful Package.json Scripts

You can add these scripts to your `package.json`:

```json
{
  "scripts": {
    "d1:create": "wrangler d1 create payper-db",
    "d1:migrate:generate": "prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script",
    "d1:migrate:local": "wrangler d1 migrations apply payper-db --local",
    "d1:migrate:remote": "wrangler d1 migrations apply payper-db --remote",
    "d1:query:local": "wrangler d1 execute payper-db --local --command",
    "d1:query:remote": "wrangler d1 execute payper-db --remote --command"
  }
}
```

## D1 Limitations

- **No transaction support**: Prisma will execute transactions as individual queries
- **Size limits**: D1 has database size limitations (check Cloudflare documentation)
- **Latency**: Being a distributed database, it may have more latency than local SQLite

## Environment Variables

Both local development and production use D1, so no `DATABASE_URL` is needed.

The D1 database binding is configured in `wrangler.jsonc` and accessed via the Cloudflare context in your code.

### Optional .env

```env
NODE_ENV=development
```

That's it! The database connection is handled automatically through the D1 binding.

## Troubleshooting

### Error: "Property 'DB' does not exist"

Make sure `cloudflare-env.d.ts` has the correct type:

```typescript
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    // ... other bindings
  }
}
```

### Error: "Cannot find module '@prisma/adapter-d1'"

```bash
npm install @prisma/adapter-d1
```

### Client doesn't connect to D1

Verify that:

1. The binding in `wrangler.jsonc` is correct
2. Migrations have been applied (`npm run d1:migrate:local` for local)
3. You're running through the Cloudflare context (`npm run dev`, `npm run preview`, or `npm run deploy`)

### Error: "Database configuration error" in development

Make sure you're running `npm run dev` which uses the OpenNext Cloudflare dev environment.

The application needs the Cloudflare context to access D1, even in local development.

## Additional Resources

- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [Prisma with D1](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1)
- [OpenNext with DB](https://opennext.js.org/cloudflare/howtos/db)
