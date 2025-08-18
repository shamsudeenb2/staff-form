import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/db";
import bcrypt from "bcryptjs";

// Server-side validation: same rules as front-end
function validatePassword(password: unknown) {
  if (typeof password !== "string") return "Password must be a string";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Include at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Include at least one number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Include at least one symbol";
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password } = body ?? {};

    if (!phone || !password) {
      return NextResponse.json({ error: "phone and password are required" }, { status: 400 });
    }

    const validationError = validatePassword(password);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // find user
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: "User with that phone not found" }, { status: 404 });
    }

    // optional: allow only if phoneVerified
    if (!user.phoneVerified) {
      return NextResponse.json({ error: "Phone not verified" }, { status: 403 });
    }

    // Hash password with bcrypt (bcryptjs)
    const saltRounds = 12;
    const hashed = await bcrypt.hash(password, saltRounds);

    await prisma.user.update({
      where: { phone },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in /api/password:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
