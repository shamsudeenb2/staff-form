import { NextResponse } from "next/server";
import prisma from "@/components/lib/db";
import { z } from "zod";
import { EmploymentSchema } from "@/components/utils/employSchema";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone") ?? "";

    const user = await prisma.user.findUnique({
        where:{phone:phone, done:false}})

        console.log("name it now",user, phone)

        if(!user){
          return NextResponse.json({ ok: false, message:"Staff not found or completed registration" }, { status: 401 });
        }

     const items = await prisma.employmentData.findUnique({
        where:{userId: user?.id}})

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/trips error", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
