-- CreateTable
CREATE TABLE "public"."FormDraft" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormDraft_phone_page_key" ON "public"."FormDraft"("phone", "page");
