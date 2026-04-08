-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "adminNotes" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "customerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Inquiry" ("createdAt", "customerId", "email", "id", "message", "name", "phone") SELECT "createdAt", "customerId", "email", "id", "message", "name", "phone" FROM "Inquiry";
DROP TABLE "Inquiry";
ALTER TABLE "new_Inquiry" RENAME TO "Inquiry";
CREATE INDEX "Inquiry_email_idx" ON "Inquiry"("email");
CREATE INDEX "Inquiry_customerId_idx" ON "Inquiry"("customerId");
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
