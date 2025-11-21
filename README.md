# Invoice Management System

A modern invoice management system built with Next.js, following hexagonal architecture principles.

## Features

- Create and manage invoices
- Track credit and debit notes
- Client management
- SQLite for local development
- Cloudflare D1 ready for production
- Clean architecture with dependency injection

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (dev) / Cloudflare D1 (prod)
- **ORM**: Prisma
- **Language**: TypeScript
- **Architecture**: Hexagonal (Ports & Adapters)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:

Create a `.env` file in the root directory:

```bash
ENV=DEV
DATABASE_URL="file:./dev.db"
```

4. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio (GUI for database)
npm run db:studio

# Push schema changes without migrations
npm run db:push
```

## Project Structure

```
src/
├── domain/              # Domain layer (entities, repositories, services)
├── application/         # Use cases (business logic)
├── infrastructure/      # Concrete implementations
│   ├── database/       # Prisma client
│   ├── repositories/   # Repository implementations
│   └── di/            # Dependency injection container
├── presentation/        # UI components
└── app/
    └── api/           # Next.js API routes
```

## API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Reference

#### Invoices

- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get invoice by ID
- `PUT /api/invoices/[id]` - Replace invoice
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

#### Notes (Credit/Debit)

- `GET /api/notes` - List all notes
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get note by ID
- `PUT /api/notes/[id]` - Replace note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

## Architecture

This project follows the **Hexagonal Architecture** pattern:

- **Domain**: Core business logic and entities
- **Application**: Use cases that orchestrate domain logic
- **Infrastructure**: External concerns (database, API clients)
- **Presentation**: UI components and pages

Benefits:
- Testability
- Maintainability
- Independence from frameworks
- Clear separation of concerns

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Deployment

### Deploy to Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to a Git repository
2. Import your project to Vercel
3. Configure environment variables
4. Deploy

### Database Migration

For production with Cloudflare D1:

1. Create a D1 database
2. Update `wrangler.toml` with your database information
3. Run migrations: `npm run db:migrate`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
