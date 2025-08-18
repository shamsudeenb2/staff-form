-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OTP" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonalData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "stateOfOrigin" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "senatorialDistrict" TEXT NOT NULL,
    "pensionAdmin" TEXT NOT NULL,
    "penComNo" TEXT NOT NULL,
    "nextOfKin" TEXT NOT NULL,
    "nextOfKinPhone" TEXT NOT NULL,

    CONSTRAINT "PersonalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EducationHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qualAt1stAppt" TEXT NOT NULL,
    "datePassed" TIMESTAMP(3),

    CONSTRAINT "EducationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdditionalQualification" (
    "id" TEXT NOT NULL,
    "educId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "datePassed" TIMESTAMP(3),
    "fileUrl" TEXT,

    CONSTRAINT "AdditionalQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmploymentData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personnelNumber" TEXT NOT NULL,
    "ippisNumber" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "dateFirstAppointed" TIMESTAMP(3) NOT NULL,
    "datePresentAppointment" TIMESTAMP(3) NOT NULL,
    "dateLastPromotion" TIMESTAMP(3) NOT NULL,
    "rankAtFirstAppointment" TEXT NOT NULL,
    "presentStation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "yearsInStation" INTEGER NOT NULL,
    "yearsInService" INTEGER NOT NULL,

    CONSTRAINT "EmploymentData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OtherData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "OtherData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalData_userId_key" ON "public"."PersonalData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationHistory_userId_key" ON "public"."EducationHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentData_userId_key" ON "public"."EmploymentData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OtherData_userId_key" ON "public"."OtherData"("userId");

-- AddForeignKey
ALTER TABLE "public"."PersonalData" ADD CONSTRAINT "PersonalData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EducationHistory" ADD CONSTRAINT "EducationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdditionalQualification" ADD CONSTRAINT "AdditionalQualification_educId_fkey" FOREIGN KEY ("educId") REFERENCES "public"."EducationHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmploymentData" ADD CONSTRAINT "EmploymentData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OtherData" ADD CONSTRAINT "OtherData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
