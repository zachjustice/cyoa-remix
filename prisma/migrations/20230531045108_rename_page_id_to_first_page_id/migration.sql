/*
  Warnings:

  - You are about to drop the column `pageId` on the `Story` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "firstPageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Story_firstPageId_fkey" FOREIGN KEY ("firstPageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Story_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Story" ("createdAt", "description", "id", "ownerId", "title", "updatedAt") SELECT "createdAt", "description", "id", "ownerId", "title", "updatedAt" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE UNIQUE INDEX "Story_id_key" ON "Story"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
