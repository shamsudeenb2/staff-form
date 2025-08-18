/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `PersonalData` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PersonalData` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `PersonalData` table. All the data in the column will be lost.
  - You are about to drop the column `stateOfOrigin` on the `PersonalData` table. All the data in the column will be lost.
  - Changed the type of `type` on the `AdditionalQualification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `presentJobDescription` to the `EmploymentData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `PersonalData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `PersonalData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `PersonalData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `PersonalData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `PersonalData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeOfBirth` to the `PersonalData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `PersonalData` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `maritalStatus` on the `PersonalData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "public"."QualificationType" AS ENUM ('ADDITIONAL', 'PROFESSIONAL');

-- AlterTable
ALTER TABLE "public"."AdditionalQualification" DROP COLUMN "type",
ADD COLUMN     "type" "public"."QualificationType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."EmploymentData" ADD COLUMN     "presentJobDescription" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PersonalData" DROP COLUMN "dateOfBirth",
DROP COLUMN "name",
DROP COLUMN "sex",
DROP COLUMN "stateOfOrigin",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" "public"."Gender" NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "placeOfBirth" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
DROP COLUMN "maritalStatus",
ADD COLUMN     "maritalStatus" "public"."MaritalStatus" NOT NULL;

-- CreateTable
CREATE TABLE "public"."PreviousStation" (
    "id" TEXT NOT NULL,
    "employmentDataId" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "yearsInStation" TEXT NOT NULL,

    CONSTRAINT "PreviousStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreviousJobHandle" (
    "id" TEXT NOT NULL,
    "employmentDataId" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "yearsInJob" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,

    CONSTRAINT "PreviousJobHandle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PreviousStation" ADD CONSTRAINT "PreviousStation_employmentDataId_fkey" FOREIGN KEY ("employmentDataId") REFERENCES "public"."EmploymentData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreviousJobHandle" ADD CONSTRAINT "PreviousJobHandle_employmentDataId_fkey" FOREIGN KEY ("employmentDataId") REFERENCES "public"."EmploymentData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
