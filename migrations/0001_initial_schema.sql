-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "taxId" TEXT,
    "logo" TEXT,
    "tipPercentage" REAL NOT NULL DEFAULT 10,
    "tipEnabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "identificationType" TEXT,
    "identificationNumber" TEXT
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "companyId" TEXT NOT NULL,
    "clientId" TEXT,
    "subtotalAmount" REAL NOT NULL DEFAULT 0,
    "subtotalCurrency" TEXT NOT NULL DEFAULT 'COP',
    "tipAmount" REAL NOT NULL DEFAULT 0,
    "tipCurrency" TEXT NOT NULL DEFAULT 'COP',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "totalCurrency" TEXT NOT NULL DEFAULT 'COP',
    "notes" TEXT,
    "dueDate" DATETIME,
    CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPriceAmount" REAL NOT NULL,
    "unitPriceCurrency" TEXT NOT NULL DEFAULT 'COP',
    "totalAmount" REAL NOT NULL,
    "totalCurrency" TEXT NOT NULL DEFAULT 'COP',
    "invoiceId" TEXT,
    "noteId" TEXT,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonDescription" TEXT NOT NULL,
    "subtotalAmount" REAL NOT NULL DEFAULT 0,
    "subtotalCurrency" TEXT NOT NULL DEFAULT 'COP',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "totalCurrency" TEXT NOT NULL DEFAULT 'COP',
    CONSTRAINT "Note_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE INDEX "Invoice_companyId_idx" ON "Invoice"("companyId");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_noteId_idx" ON "InvoiceItem"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_number_key" ON "Note"("number");

-- CreateIndex
CREATE INDEX "Note_invoiceId_idx" ON "Note"("invoiceId");

-- CreateIndex
CREATE INDEX "Note_type_idx" ON "Note"("type");
