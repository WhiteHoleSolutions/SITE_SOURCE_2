-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessInfo" (
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
    "diskSizeGB" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BusinessInfo" ("abn", "acn", "address", "businessName", "country", "createdAt", "email", "id", "logo", "paymentTerms", "phone", "postcode", "state", "suburb", "taxRate", "updatedAt", "website") SELECT "abn", "acn", "address", "businessName", "country", "createdAt", "email", "id", "logo", "paymentTerms", "phone", "postcode", "state", "suburb", "taxRate", "updatedAt", "website" FROM "BusinessInfo";
DROP TABLE "BusinessInfo";
ALTER TABLE "new_BusinessInfo" RENAME TO "BusinessInfo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
