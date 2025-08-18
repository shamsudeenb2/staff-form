/*
  Warnings:

  - You are about to drop the column `datePassed` on the `AdditionalQualification` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `AdditionalQualification` table. All the data in the column will be lost.
  - You are about to drop the column `datePassed` on the `EducationHistory` table. All the data in the column will be lost.
  - Added the required column `institution` to the `AdditionalQualification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution` to the `EducationHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AdditionalQualification" DROP COLUMN "datePassed",
DROP COLUMN "fileUrl",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "institution" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."EducationHistory" DROP COLUMN "datePassed",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "institution" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3);
