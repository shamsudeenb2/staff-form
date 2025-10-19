// app/api/admin/submission-windows/route.ts
import {NextRequest, NextResponse } from "next/server";
import  prisma  from "@/components/lib/db";
import { z } from "zod";
// import { getServerSession } from "next-auth"; // adapt to your auth

const BodySchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
  isOpen: z.boolean(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const yearMonth = searchParams.get('yearMonth');

  if (yearMonth) {
    const windows = await prisma.submissionWindow.findMany({ where: { yearMonth: yearMonth } });
    return NextResponse.json({ success: true, windows });
  }
  // list all windows
  const windows = await prisma.submissionWindow.findMany({ orderBy: { yearMonth: "desc" } });
  return NextResponse.json({ success: true, windows });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.parse(body);

    // auth (ensure admin). Replace with your auth check
    // const session = await getServerSession(...); if(!session || session.user.role !== 'admin') return NextResponse.json({error:'forbidden'}, {status:403});

    // upsert by yearMonth
    const existing = await prisma.submissionWindow.findUnique({ where: { yearMonth: parsed.yearMonth } });
    if (existing) {
      const updated = await prisma.submissionWindow.update({
        where: { yearMonth: parsed.yearMonth },
        data: {
          isOpen: parsed.isOpen,
          note: parsed.note ?? existing.note,
          ...(parsed.isOpen ? { openAt: new Date(), openedBy: "admin" } : { closeAt: new Date(), closedBy: "admin" }),
        },
      });
      return NextResponse.json({ success: true, window: updated });
    } else {
      const created = await prisma.submissionWindow.create({
        data: {
          yearMonth: parsed.yearMonth,
          isOpen: parsed.isOpen,
          note: parsed.note,
          ...(parsed.isOpen ? { openAt: new Date(), openedBy: "admin" } : {}),
        },
      });
      return NextResponse.json({ success: true, window: created });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
