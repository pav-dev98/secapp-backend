-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notify" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" VARCHAR(20);
