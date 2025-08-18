


// app/api/others/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const phone = formData.get(`phone`) as string;
     
    console.log("name are ", phone)

    // Extract dynamic certificates        
   const user = await prisma.user.findUnique({ where: { phone:phone } });
        if (!user) {
          return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

    const existing = await prisma.otherData.findUnique({
      where: { userId:user.id },
    });

    const certificates: any[] = [];
    let index = 0;
    while (formData.has(`certificates[${index}][title]`)) {
      const title = formData.get(`certificates[${index}][title]`) as string;
      const dateIssued = formData.get(`certificates[${index}][dateIssued]`) as string;
      const skills = formData.get(`certificates[${index}][skills]`) as string;
      const file = formData.get(`certificates[${index}][fileUrl]`) as File | null;

      // TODO: save file somewhere (S3, Cloudinary, local disk, etc.)
      let filePath = null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Example: save to local `uploads/`
        const fs = require("fs");
        const path = `./uploads/${file.name}`;
        fs.writeFileSync(path, buffer);
        filePath = path;
      }

      certificates.push({ title, dateIssued, skills, filePath });
      index++;
    }

    // Save to database as JSON in OtherData.content
    const result = await prisma.otherData.upsert({
      where: { userId: user.id }, // <- use session/auth to get userId
      update: { content: certificates },
      create: {
        userId: user.id,
        content: certificates,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}




export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const data = await prisma.otherData.findUnique({
      where: { userId },
    });

    return NextResponse.json(data || {});
  } catch (error) {
    console.error("Error fetching other data:", error);
    return NextResponse.json({ error: "Failed to fetch other data" }, { status: 500 });
  }
}
