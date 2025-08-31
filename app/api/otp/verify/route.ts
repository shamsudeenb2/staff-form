
// app/api/otp/verify/route.ts
import { NextResponse } from "next/server";
import { verifyOtpCode } from "@/components/lib/otp";

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) return NextResponse.json({ error: "phone & code required" }, { status: 400 });

    const ok = await verifyOtpCode(phone, code);
    return NextResponse.json({ success: ok });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}