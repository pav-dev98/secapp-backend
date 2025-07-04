/*
  Warnings:

  - The `type` column on the `incidents` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('PANIC_ALERT', 'ROBBERY', 'TRAFFIC_ACCIDENT', 'VANDALISM', 'VIOLENCE');

-- AlterTable
ALTER TABLE "incidents" DROP COLUMN "type",
ADD COLUMN     "type" "IncidentType";
