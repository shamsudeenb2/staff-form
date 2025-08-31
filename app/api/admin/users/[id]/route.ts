import { NextRequest, NextResponse } from "next/server";
import prisma from "@/components/lib/db"; // adjust if your prisma client path differs

type Params = {
  params: { id: string };
};

export async function GET(_req: NextRequest, context: any) {
  try {
    const { params } = context as { params: { id: string } };
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        personalData: true,
        educationHistory: {
          include: { addQualification: true },
        },
        employmentData: {
          include: {
            previousStations: true,
            previousJobsHandled: true,
            previousPromotion: true,
          },
        },
        otherData: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
