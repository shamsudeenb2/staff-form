// app/api/draft/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
//   const phone = searchParams.get("phone");
//   const page = searchParams.get("page");

//   if (!phone || !page) {
//     return NextResponse.json({ error: "Phone and page are required" }, { status: 400 });
//   }

  const usersRaw = await prisma.user.findMany({
      select: {
        id: true,
        done:true,
    personalData: {
        select: { firstName: true, lastName: true },
    },
  }
  });

      const users = usersRaw.map((u) => {
      const firstName = u.personalData?.firstName ?? "";
      const lastName = u.personalData?.lastName ?? "";
      const name = `${firstName} ${lastName}`.trim();
      const done = u.done
     return {
        id: u.id,
        name,
        done,
      };
    });

  const completedUsers = users.filter((u) => u.done);

  return NextResponse.json(completedUsers || {});
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
//   const phone = searchParams.get("phone");
//   const page = searchParams.get("page");
    const body = await req.json();
    const { role, id } = body;

//   if (!phone || !page) {
//     return NextResponse.json({ error: "Phone and page are required" }, { status: 400 });
//   }

      try {
    await prisma.user.update({
      where: { id: id },
      data: { role: role },
    });

    return NextResponse.json({ success: true });
 } catch (error) {
    console.error("Error updating role field:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}