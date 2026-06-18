-- Add publicToken column with DB-level default so existing rows get UUIDs
ALTER TABLE "Quote" ADD COLUMN "publicToken" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- Add unique constraint
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_publicToken_key" UNIQUE ("publicToken");

-- Remove the DB-level default (Prisma will handle it at application level from now on)
ALTER TABLE "Quote" ALTER COLUMN "publicToken" DROP DEFAULT;
