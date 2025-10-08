import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import prisma from "@/components/lib/db";

export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

    const { phone } = await req.json();

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
          return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { done: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating done field:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
