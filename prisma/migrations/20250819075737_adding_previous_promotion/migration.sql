-- CreateTable
CREATE TABLE "public"."PreviousPromotion" (
    "id" TEXT NOT NULL,
    "employmentDataId" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "PreviousPromotion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PreviousPromotion" ADD CONSTRAINT "PreviousPromotion_employmentDataId_fkey" FOREIGN KEY ("employmentDataId") REFERENCES "public"."EmploymentData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
