// app/api/otp/verify/route.ts
// import { NextResponse } from "next/server";
// import { verifyOTP } from "@/components/lib/otp";

// export async function POST(req: Request) {
//   const { phone, code } = await req.json();

//   if (!phone || !code) {
//     return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 });
//   }

//   const result = await verifyOTP(phone, code);
//   return NextResponse.json({ success: result });
// }


// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const { phone, otp } = await req.json();
//   if (!phone || !otp) {
//     return NextResponse.json({ error: "Phone & OTP required" }, { status: 400 });
//   }

//   if (globalThis[`otp_${phone}`] === otp) {
//     delete globalThis[`otp_${phone}`];
//     return NextResponse.json({ success: true });
//   }

//   return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
// }


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