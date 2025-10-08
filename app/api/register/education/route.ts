// /app/api/education/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";
// import { getServerSession } from "next-auth";
import { EduSchema, EducationalFormType } from "@/components/utils/eduSchema";

export async function POST(req: Request) {
  try {
    // const session = await getServerSession();
    // if (!session || !session.user?.email) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

      const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    // const body = await req.json();
    const {phone, data } = body;
    console.log("name them now.",data, phone)
    const data1 = EduSchema.parse(data);
    console.log("name them now.",data)
    // Get the user
    const normalizedPhone = phone.trim();
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      return NextResponse.json({ error: "User not Found" }, { status: 404 });
    }

    // if (!user.phoneVerified) {
    //   return NextResponse.json({ error: "You have not validate you phone number" }, { status: 404 });
    // }

    // Create Education
    const education = await prisma.educationHistory.upsert({
      where: { userId: user.id },
      create:{
        qualAt1stAppt: data1.highestQualification,
        institution:data1.institutionAttended,
        startDate: data1.startYear,
        endDate:data1.endYear,
        userId: user.id,
        addQualification: {
          create: data1?.additionalQualifications?.map((aq: any) => ({
            type:aq.type,
            qualification: aq.qualification,
            institution: aq.institution,
            startDate: aq.start,
            endDate: aq.end
          }))
        }
      },
      include: { addQualification: true },
      update:{
        qualAt1stAppt: data1.highestQualification,
        institution:data1.institutionAttended,
        startDate: data1.startYear,
        endDate:data1.endYear,
        userId: user.id,
        addQualification: {
          create: data1?.additionalQualifications?.map((aq: any) => ({
            type:aq.type,
            qualification: aq.qualification,
            institution: aq.institution,
            startDate: aq.start,
            endDate: aq.end
          }))
        }
      },
    });

    return NextResponse.json({ success: true, education });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
