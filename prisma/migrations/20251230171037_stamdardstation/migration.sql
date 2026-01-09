-- AlterTable
ALTER TABLE "EmploymentData" ADD COLUMN     "standardStationId" INTEGER;

-- CreateTable
CREATE TABLE "StandardStation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "StandardStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StandardStation_name_key" ON "StandardStation"("name");

-- AddForeignKey
ALTER TABLE "EmploymentData" ADD CONSTRAINT "EmploymentData_standardStationId_fkey" FOREIGN KEY ("standardStationId") REFERENCES "StandardStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
