-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('DRAFT', 'FINAL');

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'staff';

-- CreateTable
CREATE TABLE "public"."MonthlySubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "previousSubmissionId" TEXT,
    "diff" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubmissionWindow" (
    "id" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "openAt" TIMESTAMP(3),
    "closeAt" TIMESTAMP(3),
    "openedBy" TEXT,
    "closedBy" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionWindow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlySubmission_yearMonth_idx" ON "public"."MonthlySubmission"("yearMonth");

-- CreateIndex
CREATE INDEX "MonthlySubmission_status_idx" ON "public"."MonthlySubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySubmission_userId_yearMonth_key" ON "public"."MonthlySubmission"("userId", "yearMonth");

-- CreateIndex
CREATE INDEX "SubmissionWindow_isOpen_idx" ON "public"."SubmissionWindow"("isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionWindow_yearMonth_key" ON "public"."SubmissionWindow"("yearMonth");

-- AddForeignKey
ALTER TABLE "public"."MonthlySubmission" ADD CONSTRAINT "MonthlySubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
