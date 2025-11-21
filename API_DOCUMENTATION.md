# API Documentation - Invoice App

## Development Setup

This project uses **SQLite** for local development and is prepared to use **Cloudflare D1** in production.

### Environment Variables

Create a `.env` file in the project root:

```bash
ENV=DEV
DATABASE_URL="file:./dev.db"
```

### Database Scripts

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio (graphical interface for the DB)
npm run db:studio

# Push schema changes without creating migrations
npm run db:push
```

## Architecture

The project follows a **hexagonal architecture (ports and adapters)**:

```
src/
├── domain/              # Domain layer (entities, repositories, services)
├── application/         # Use cases
├── infrastructure/      # Concrete implementations
│   ├── database/       # Prisma client
│   ├── repositories/   # Prisma and LocalStorage repositories
│   └── di/            # Dependency injection container
└── app/
    └── api/           # Next.js API Routes
```

## API Endpoints

### Invoices

#### GET `/api/invoices`

Gets all invoices or the most recent ones.

**Query Parameters:**

- `limit` (optional): Number of recent invoices to retrieve

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "number": "INV-20251117-123456",
      "status": "draft",
      "company": { ... },
      "client": { ... },
      "items": [ ... ],
      "subtotal": { "amount": 1000, "currency": "COP" },
      "tipAmount": { "amount": 100, "currency": "COP" },
      "total": { "amount": 1100, "currency": "COP" },
      "notes": "Optional notes",
      "dueDate": "2025-12-31T00:00:00.000Z",
      "createdAt": "2025-11-17T00:00:00.000Z",
      "updatedAt": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/invoices`

Creates a new invoice.

**Request Body:**
```json
{
  "client": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "identificationType": "CC",
    "identificationNumber": "12345678"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### GET `/api/invoices/[id]`

Gets an invoice by ID.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### PUT `/api/invoices/[id]`

Completely replaces an invoice (all fields are required).

**Request Body:**

```json
{
  "client": { ... },
  "items": [
    {
      "description": "Product 1",
      "quantity": 2,
      "unitPrice": { "amount": 500, "currency": "COP" }
    }
  ],
  "notes": "Updated notes",
  "dueDate": "2025-12-31T00:00:00.000Z",
  "status": "pending"
}
```

#### PATCH `/api/invoices/[id]`

Partially updates an invoice (only send the fields you want to change).

**Request Body (example):**

```json
{
  "status": "completed",
  "notes": "Invoice completed"
}
```

#### DELETE `/api/invoices/[id]`

Deletes an invoice.

**Response:**
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

---

### Notes (Credit/Debit Notes)

#### GET `/api/notes`

Gets all notes.

**Query Parameters:**

- `invoiceId` (optional): Filter by invoice ID
- `type` (optional): Filter by type (`credit` or `debit`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "number": "NC-20251117-123456",
      "type": "credit",
      "invoiceId": "uuid",
      "reason": "return",
      "reasonDescription": "Customer returned product",
      "items": [ ... ],
      "subtotal": { "amount": 500, "currency": "COP" },
      "total": { "amount": 500, "currency": "COP" },
      "createdAt": "2025-11-17T00:00:00.000Z",
      "updatedAt": "2025-11-17T00:00:00.000Z"
    }
  ]
}
```

#### POST `/api/notes`

Creates a new note.

**Request Body:**

```json
{
  "type": "credit",
  "invoiceId": "invoice-uuid",
  "reason": "return",
  "reasonDescription": "Customer returned defective product",
  "items": [
    {
      "description": "Returned product",
      "quantity": 1,
      "unitPrice": { "amount": 500, "currency": "COP" }
    }
  ]
}
```

**Valid values for `type`:**

- `credit`: Credit note
- `debit`: Debit note

**Valid values for `reason`:**

- `return`: Return
- `discount`: Discount
- `error`: Billing error
- `cancellation`: Cancellation
- `additional_charge`: Additional charge
- `service_charge`: Service charge
- `other`: Other reason

#### GET `/api/notes/[id]`

Gets a note by ID.

#### PUT `/api/notes/[id]`

Completely replaces a note.

#### PATCH `/api/notes/[id]`

Partially updates a note.

**Request Body (example):**

```json
{
  "reasonDescription": "Updated description"
}
```

#### DELETE `/api/notes/[id]`

Deletes a note.

---

## Difference between PUT and PATCH

- **PUT**: Replaces the entire resource. You must send all required fields.
- **PATCH**: Updates only the fields you send. Other fields remain unchanged.

### Example

```bash
# PUT - Complete replacement
curl -X PUT http://localhost:3000/api/invoices/123 \
  -H "Content-Type: application/json" \
  -d '{
    "client": { "firstName": "John", "lastName": "Doe" },
    "items": [...],
    "notes": "New note",
    "status": "pending"
  }'

# PATCH - Update only the status
curl -X PATCH http://localhost:3000/api/invoices/123 \
  -H "Content-Type: application/json" \
  -d '{ "status": "completed" }'
```

## Error Handling

All APIs return errors in the following format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

**HTTP Status Codes:**

- `200`: OK
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Testing with curl

```bash
# Create an invoice
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "client": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'

# Get all invoices
curl http://localhost:3000/api/invoices

# Get last 5 invoices
curl http://localhost:3000/api/invoices?limit=5

# Update invoice status
curl -X PATCH http://localhost:3000/api/invoices/[id] \
  -H "Content-Type: application/json" \
  -d '{ "status": "completed" }'
```
