/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Note_id_key";

-- DropIndex
DROP INDEX "_PermissionToRole_B_index";

-- DropIndex
DROP INDEX "_PermissionToRole_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PermissionToRole";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "StoryMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "permissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryMember_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StoryMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StoryMember_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Choice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "parentPageId" TEXT NOT NULL,
    "nextPageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Choice_parentPageId_fkey" FOREIGN KEY ("parentPageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Choice_nextPageId_fkey" FOREIGN KEY ("nextPageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Choice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Choice" ("content", "createdAt", "id", "nextPageId", "ownerId", "parentPageId", "updatedAt") SELECT "content", "createdAt", "id", "nextPageId", "ownerId", "parentPageId", "updatedAt" FROM "Choice";
DROP TABLE "Choice";
ALTER TABLE "new_Choice" RENAME TO "Choice";
CREATE UNIQUE INDEX "Choice_id_key" ON "Choice"("id");
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "firstPageId" TEXT,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_firstPageId_fkey" FOREIGN KEY ("firstPageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Story_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Story" ("createdAt", "description", "firstPageId", "id", "ownerId", "title", "updatedAt") SELECT "createdAt", "description", "firstPageId", "id", "ownerId", "title", "updatedAt" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE UNIQUE INDEX "Story_id_key" ON "Story"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "StoryMember_id_key" ON "StoryMember"("id");
