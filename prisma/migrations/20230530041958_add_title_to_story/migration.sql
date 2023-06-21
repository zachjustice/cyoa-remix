/*
Warnings:

- Added the required column `title` to the `Story` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys = OFF;

CREATE TABLE
	"new_Story" (
		"id" TEXT NOT NULL PRIMARY KEY,
		"title" TEXT NOT NULL,
		"description" TEXT NOT NULL,
		"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		"updatedAt" DATETIME NOT NULL,
		"ownerId" TEXT NOT NULL,
		"pageId" TEXT NOT NULL,
		CONSTRAINT "Story_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
		CONSTRAINT "Story_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
	);

INSERT INTO
	"new_Story" (
		"createdAt",
		"description",
		"id",
		"ownerId",
		"pageId",
		"updatedAt"
	)
SELECT
	"createdAt",
	"description",
	"id",
	"ownerId",
	"pageId",
	"updatedAt"
FROM
	"Story";

DROP TABLE "Story";

ALTER TABLE "new_Story"
RENAME TO "Story";

CREATE UNIQUE INDEX "Story_id_key" ON "Story" ("id");

PRAGMA foreign_key_check;

PRAGMA foreign_keys = ON;
