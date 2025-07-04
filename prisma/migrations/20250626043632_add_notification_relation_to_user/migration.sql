/*
  Warnings:

  - Changed the type of `type` on the `incidents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('PANIC_ALERT', 'ROBBERY', 'TRAFFIC_ACCIDENT', 'VANDALISM', 'VIOLENCE');

-- AlterTable
ALTER TABLE "incidents" DROP COLUMN "type",
ADD COLUMN     "type" "IncidentType" NOT NULL;
