/*
  Warnings:

  - A unique constraint covering the columns `[personnelNumber]` on the table `EmploymentData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ippisNumber]` on the table `EmploymentData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[penComNo]` on the table `PersonalData` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."OtherData" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "done" BOOLEAN DEFAULT false,
ADD COLUMN     "role" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentData_personnelNumber_key" ON "public"."EmploymentData"("personnelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentData_ippisNumber_key" ON "public"."EmploymentData"("ippisNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalData_penComNo_key" ON "public"."PersonalData"("penComNo");
