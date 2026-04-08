-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlbumAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "albumId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'VIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlbumAccess_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlbumAccess_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AlbumAccess" ("albumId", "createdAt", "customerId", "id") SELECT "albumId", "createdAt", "customerId", "id" FROM "AlbumAccess";
DROP TABLE "AlbumAccess";
ALTER TABLE "new_AlbumAccess" RENAME TO "AlbumAccess";
CREATE INDEX "AlbumAccess_albumId_idx" ON "AlbumAccess"("albumId");
CREATE INDEX "AlbumAccess_customerId_idx" ON "AlbumAccess"("customerId");
CREATE UNIQUE INDEX "AlbumAccess_albumId_customerId_key" ON "AlbumAccess"("albumId", "customerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
