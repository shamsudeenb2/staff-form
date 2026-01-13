import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust based on your prisma location
import { z } from "zod";

// Validation schema for production safety
 const StationSchema = z.object({
  id: z.number(), // Or .min(1) if not UUID
  name: z.string(),
  type: z.string(),
});
const updateSchema = z.object({
  standardStationId: StationSchema.shape.id,
  presentStation: z.string().min(1, "Station is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  rank: z.string().min(1, "Rank is required"),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        employmentData: {
          select: {
            id:true,
            gradeLevel: true,
            presentStation:true,
            rank:true,
            standardStation: { select: { id:true,name: true } } 
          },
        
        },
      },
    });
    return NextResponse.json({success:true, data:user?.employmentData});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validatedData = updateSchema.parse(body);
    console.log("let name the error",validatedData)
    const { id } = await params;
    const updatedUser = await prisma.employmentData.update({
      where: { id: id },
      data: validatedData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}