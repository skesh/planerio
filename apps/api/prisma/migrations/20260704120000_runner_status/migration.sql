-- AlterTable
ALTER TABLE "Runner" DROP COLUMN "errorMessage",
ALTER COLUMN "lastStatus" SET DEFAULT 'idle';
UPDATE "Runner" SET "lastStatus" = 'idle' WHERE "lastStatus" IS NULL;
ALTER TABLE "Runner" ALTER COLUMN "lastStatus" SET NOT NULL;
ALTER TABLE "Runner" RENAME COLUMN "lastStatus" TO "status";
