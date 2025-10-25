// /app/api/personal/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/db"; // adjust path if your prisma client is exported elsewhere
import { Prisma } from "@prisma/client";

/**
 * Expected request body:
 * {
 *   phone: string,               // required - used to identify/upsert the User
 *   data: {
 *     email?: string,            // will update the user.email
 *     firstName?: string,
 *     lastName?: string,
 *     gender?: string,
 *     dob?: string,              // ISO date string (yyyy-mm-dd) preferred
 *     maritalStatus?: string,
 *     address?: string,
 *     lga?: string,
 *     state?: string,
 *     placeOfBirth?: string,
 *     senatorialDistrict?: string,
 *     pensionAdmin?: string,
 *     penComNo?: string,
 *     nextOfKin?: string,
 *     nextOfKinPhone?: string
 *   }
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { phone, data } = body;
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }

    // sanitize phone (simple) - you can adapt to your phone normalization rules
    const normalizedPhone = phone.trim();

    // Pull email out if present
    const email = data.email ? String(data.email).trim() : null;

    // 1) Upsert user based on phone (phone is unique in your schema)
    //    - If user exists: update email (if provided)
    //    - If user does not exist: create user with phone and email (if provided)
    let user;
    try {
      user = await prisma.user.upsert({
        where: { phone: normalizedPhone,},
        create: {
          phone: normalizedPhone,
          email: email || null,
        },
        update: {
          // only update email when provided (null will not overwrite if undefined)
          ...(email ? { email } : {}),
        },
      });
    } catch (err) {
      // Handle unique constraint problems (e.g. email already used by another account)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        // err.meta contains the target field
        return NextResponse.json(
          {
            error: "Unique constraint failed",
            meta: (err as any).meta ?? null,
          },
          { status: 409 }
        );
      }
      console.error("User upsert error:", err);
      return NextResponse.json({ error: "Failed to upsert user" }, { status: 500 });
    }

    // 2) Prepare personalData payload (only include fields actually provided)
    const personalFields: any = {};
    const allowedStringFields = [
      "firstName",
      "lastName",
      "gender",
      "maritalStatus",
      "address",
      "lga",
      "state",
      "placeOfBirth",
      "senatorialDistrict",
      "pensionAdmin",
      "penComNo",
      "nextOfKin",
      "nextOfKinPhone",
    ];

    for (const key of allowedStringFields) {
      if (data[key] !== undefined && data[key] !== null) {
        personalFields[key] = String(data[key]);
      }
    }

    // dob: handle ISO date string → Date object if valid
    if (data.dob) {
      const date = new Date(String(data.dob));
      if (!isNaN(date.getTime())) {
        personalFields.dob = date;
      } else {
        // invalid date string — return 400
        return NextResponse.json({ error: "Invalid dob format" }, { status: 400 });
      }
    }

    // Ensure userId present on create
    const upsertDataCreate = { userId: user.id, ...personalFields };
    const upsertDataUpdate = { ...personalFields };

    // 3) Upsert PersonalData (one-to-one by userId)
    let personal;
    try {
      personal = await prisma.personalData.upsert({
        where: { userId: user.id },
        create: upsertDataCreate,
        update: upsertDataUpdate,
      });
    } catch (err) {
      console.error("PersonalData upsert error:", err);
      return NextResponse.json({ error: "Failed to save personal data" }, { status: 500 });
    }

    // 4) Success — return redirectUrl so frontend can navigate to next step
    //    Change '/register/education' to whatever your next route is
    return NextResponse.json({
      success: true,
      message: "Personal data saved",
      redirectUrl: "/register/education",
      userId: user.id,
      personalId: personal.id,
    });
  } catch (error) {
    console.error("Unexpected error in /api/personal POST:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
