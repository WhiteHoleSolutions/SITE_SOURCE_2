-- CreateTable
CREATE TABLE "BusinessInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    "abn" TEXT,
    "acn" TEXT,
    "address" TEXT,
    "suburb" TEXT,
    "state" TEXT,
    "postcode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Australia',
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "taxRate" REAL NOT NULL DEFAULT 10.0,
    "paymentTerms" TEXT NOT NULL DEFAULT 'Net 30',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BillOfSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerAddress" TEXT,
    "sellerPhone" TEXT,
    "sellerEmail" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerAddress" TEXT,
    "buyerPhone" TEXT,
    "buyerEmail" TEXT,
    "equipmentType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serialNumber" TEXT,
    "condition" TEXT,
    "salePrice" REAL NOT NULL,
    "gstIncluded" BOOLEAN NOT NULL DEFAULT true,
    "gstAmount" REAL,
    "saleDate" DATETIME NOT NULL,
    "notes" TEXT,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expenseNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "gstAmount" REAL,
    "vendor" TEXT,
    "paymentMethod" TEXT,
    "expenseDate" DATETIME NOT NULL,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BillOfSale_billNumber_key" ON "BillOfSale"("billNumber");

-- CreateIndex
CREATE INDEX "BillOfSale_billNumber_idx" ON "BillOfSale"("billNumber");

-- CreateIndex
CREATE INDEX "BillOfSale_type_idx" ON "BillOfSale"("type");

-- CreateIndex
CREATE INDEX "BillOfSale_saleDate_idx" ON "BillOfSale"("saleDate");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_expenseNumber_key" ON "Expense"("expenseNumber");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");

-- CreateIndex
CREATE INDEX "Expense_expenseNumber_idx" ON "Expense"("expenseNumber");
