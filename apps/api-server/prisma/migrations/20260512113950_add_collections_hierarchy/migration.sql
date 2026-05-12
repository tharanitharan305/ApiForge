-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePath" TEXT NOT NULL,
    "headers" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collections_projectId_idx" ON "collections"("projectId");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create default collection for each project with existing APIs
INSERT INTO "collections" ("id", "projectId", "name", "description", "basePath", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    "projectId",
    'Default',
    'Auto-created collection for existing APIs',
    '/',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "apis"
GROUP BY "projectId";

-- Add collectionId column (nullable first)
ALTER TABLE "apis" ADD COLUMN "collectionId" TEXT;

-- Update existing APIs to use the default collection
UPDATE "apis" a
SET "collectionId" = c."id"
FROM "collections" c
WHERE c."projectId" = a."projectId" AND c."name" = 'Default';

-- Make collectionId required
ALTER TABLE "apis" ALTER COLUMN "collectionId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "apis" DROP CONSTRAINT "apis_projectId_fkey";

-- DropIndex
DROP INDEX "apis_projectId_idx";

-- Drop projectId column
ALTER TABLE "apis" DROP COLUMN "projectId";

-- CreateIndex
CREATE INDEX "apis_collectionId_idx" ON "apis"("collectionId");

-- AddForeignKey
ALTER TABLE "apis" ADD CONSTRAINT "apis_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
