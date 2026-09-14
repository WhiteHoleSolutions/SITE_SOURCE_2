-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LEAD',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "clientGoal" TEXT,
    "internalNotes" TEXT,
    "location" TEXT,
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "quotedAmount" REAL NOT NULL DEFAULT 0,
    "actualCost" REAL NOT NULL DEFAULT 0,
    "customerId" TEXT,
    "inquiryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Job_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "scope" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobService_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "jobId" TEXT REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD COLUMN "jobId" TEXT REFERENCES "Job" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNumber_key" ON "Job"("jobNumber");
CREATE UNIQUE INDEX "Job_inquiryId_key" ON "Job"("inquiryId");
CREATE INDEX "Job_status_idx" ON "Job"("status");
CREATE INDEX "Job_customerId_idx" ON "Job"("customerId");
CREATE INDEX "Job_dueDate_idx" ON "Job"("dueDate");
CREATE INDEX "JobService_jobId_idx" ON "JobService"("jobId");
CREATE INDEX "JobService_serviceType_idx" ON "JobService"("serviceType");
CREATE INDEX "Invoice_jobId_idx" ON "Invoice"("jobId");
CREATE INDEX "Expense_jobId_idx" ON "Expense"("jobId");
