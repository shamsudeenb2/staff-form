// app/api/draft/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";

export async function POST(req: Request) {
  try {
    const { phone, page, data } = await req.json();

    if (!phone || !page) {
      return NextResponse.json({ error: "Phone and page are required" }, { status: 400 });
    }

    const draft = await prisma.formDraft.upsert({
      where: { phone_page: { phone, page } },
      update: { data },
      create: { phone, page, data },
    });

    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const page = searchParams.get("page");

  if (!phone || !page) {
    return NextResponse.json({ error: "Phone and page are required" }, { status: 400 });
  }

  const draft = await prisma.formDraft.findUnique({
    where: { phone_page: { phone, page } },
  });

  return NextResponse.json(draft || {});
}
