# D1 Migrations Directory

This directory contains SQL migration files for Cloudflare D1 database.

## Important Notes

- These migrations are derived from Prisma migrations located in `prisma/migrations/`
- D1 expects flat SQL files (e.g., `0001_initial_schema.sql`, `0002_add_field.sql`)
- Prisma uses a folder structure with `migration.sql` inside each folder

## Workflow

When you create a new Prisma migration:

1. Run `npm run db:migrate` to create a Prisma migration
2. Copy the generated `migration.sql` to this directory with a sequential name
3. Apply to D1 local: `npm run d1:migrate:local`
4. Apply to D1 remote: `npm run d1:migrate:remote`

## Current Migrations

- `0001_initial_schema.sql` - Initial database schema (Company, Client, Invoice, InvoiceItem, Note)

## DO NOT

- Do not manually edit applied migrations
- Do not delete files from this directory once they've been applied to production
- Do not skip version numbers
