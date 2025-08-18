import { NextResponse } from "next/server";
import prisma from "@/components/lib/db";
import { z } from "zod";
import { EmploymentSchema } from "@/components/utils/employSchema";

// Server-side schema to validate payload
const PayloadSchema = z.object({
  phone: z.string().min(7),
  data: EmploymentSchema,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, data } = PayloadSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Upsert employment data and replace children atomically
    const saved = await prisma.employmentData.upsert({
      where: { userId: user.id },
      update: {
        personnelNumber: data.personnelNumber,
        ippisNumber: data.ippisNumber,
        rank: data.rank,
        gradeLevel: data.gradeLevel,
        step: data.step,
        dateFirstAppointed: new Date(data.dateFirstAppointed),
        datePresentAppointment: new Date(data.datePresentAppointment),
        dateLastPromotion: new Date(data.dateLastPromotion),
        rankAtFirstAppointment: data.rankAtFirstAppointment,
        presentStation: data.presentStation,
        presentJobDescription: data.presentJobDescription,
        department: data.department,
        yearsInStation: data.yearsInStation,
        yearsInService: data.yearsInService,
        previousStations: {
          deleteMany: {}, // clear old rows
          create: data.previousStations.map((ps) => ({
            station: ps.station,
            yearsInStation: ps.yearsInStation,
          })),
        },
        previousJobsHandled: {
          deleteMany: {},
          create: data.previousJobsHandled.map((pj) => ({
            job: pj.job,
            yearsInJob: pj.yearsInJob,
            jobDescription: pj.jobDescription,
          })),
        },
      },
      create: {
        userId: user.id,
        personnelNumber: data.personnelNumber,
        ippisNumber: data.ippisNumber,
        rank: data.rank,
        gradeLevel: data.gradeLevel,
        step: data.step,
        dateFirstAppointed: new Date(data.dateFirstAppointed),
        datePresentAppointment: new Date(data.datePresentAppointment),
        dateLastPromotion: new Date(data.dateLastPromotion),
        rankAtFirstAppointment: data.rankAtFirstAppointment,
        presentStation: data.presentStation,
        presentJobDescription: data.presentJobDescription,
        department: data.department,
        yearsInStation: data.yearsInStation,
        yearsInService: data.yearsInService,
        previousStations: {
          create: data.previousStations.map((ps) => ({
            station: ps.station,
            yearsInStation: ps.yearsInStation,
          })),
        },
        previousJobsHandled: {
          create: data.previousJobsHandled.map((pj) => ({
            job: pj.job,
            yearsInJob: pj.yearsInJob,
            jobDescription: pj.jobDescription,
          })),
        },
      },
      include: {
        previousStations: true,
        previousJobsHandled: true,
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    console.error(err);
    if (err?.issues) {
      return NextResponse.json({ success: false, error: "Invalid payload", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// (Optional) Allow resume-from-server on page load if you want:
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  if (!phone) return NextResponse.json({ success: false, error: "Phone required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

  const record = await prisma.employmentData.findUnique({
    where: { userId: user.id },
    include: { previousStations: true, previousJobsHandled: true },
  });

  return NextResponse.json({ success: true, data: record ?? null });
}
