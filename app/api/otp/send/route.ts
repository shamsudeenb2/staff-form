// // app/api/otp/send/route.ts
// import { NextResponse } from "next/server";
// import { generateOTP } from "@/components/lib/otp";
// import { prisma } from "@/lib/db";
// // Import your SMS API (Twilio, Termii, etc.)
// import { sendSMS } from "@/components/lib/sms"; // Create this later

// export async function POST(req: Request) {
//   const { phone } = await req.json();

//   if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });

//   // Check if already validated
//   const user = await prisma.user.findUnique({ where: { phone } });
//   if (user && user.phoneVerified) {
//     return NextResponse.json({ verified: true });
//   }

//   const code = await generateOTP(phone);
//   await sendSMS(phone, `Your NIPOST OTP code is: ${code}`); // Simulated SMS

//   return NextResponse.json({ success: true });
// }


// import { NextResponse } from "next/server";
// import LRU from "lru-cache";

// const isProd = process.env.NODE_ENV === "production";
// const TERMII_API_KEY = process.env.TERMII_API_KEY;
// const TERMII_BASE_URL = "https://api.ng.termii.com/api/sms/send";

// // Rate limit: 1 request per 60 seconds per phone
// const rateLimitCache = new LRU({
//   max: 500,
//   ttl: 1000 * 60, // 1 min
// });

// async function sendTermiiSMS(phone: string, message: string) {
//   const res = await fetch(TERMII_BASE_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       api_key: TERMII_API_KEY,
//       to: phone,
//       from: "NIPOST",
//       sms: message,
//       type: "plain",
//       channel: "generic",
//     }),
//   });
//   return await res.json();
// }

// async function sendMockSMS(phone: string, message: string) {
//   console.log(`📱 Mock SMS to ${phone}: ${message}`);
//   return { status: "mock_sent" };
// }

// export async function POST(req: Request) {
//   try {
//     const { phone } = await req.json();
//     if (!phone) {
//       return NextResponse.json({ error: "Phone is required" }, { status: 400 });
//     }

//     // Rate limiting
//     if (rateLimitCache.has(phone)) {
//       return NextResponse.json({ error: "Please wait before requesting another OTP" }, { status: 429 });
//     }
//     rateLimitCache.set(phone, true);

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const message = `Your OTP code is ${otp}`;

//     // Store OTP in memory (replace with DB in production)
//     globalThis[`otp_${phone}`] = otp;

//     if (isProd) {
//       await sendTermiiSMS(phone, message);
//     } else {
//       await sendMockSMS(phone, message);
//     }

//     return NextResponse.json({ success: true, otp: isProd ? undefined : otp }); // Show OTP in dev
//   } catch (err) {
//     return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
//   }
// }

// / app/api/otp/send/route.ts
import { NextResponse,NextRequest } from "next/server";
import { createOtpForPhone } from "@/components/lib/otp";
import { sendSms } from "@/components/lib/sms";
import { prisma } from "@/components/lib/db";
import rateLimit from "express-rate-limit";

// const otpRequests: Record<string, { count: number; lastRequest: number }> = {};

export async function POST(req: NextRequest) {
  console.log("lets see the phone")
  try {
    const { phone } = await req.json();
    
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

    // check existing validated user
    const user = await prisma.user.findUnique({ 
      where: { phone } 
    });

     if (user && user.done) return NextResponse.json({ done: true });
  
    if (user && user.phoneVerified) return NextResponse.json({ verified: true });

   

  
    const { code, expiresAt } = await createOtpForPhone(phone);
    const message = `Your NIPOST OTP is: ${code} (valid 5 minutes)`;
    const sendResult = await sendSms(phone, message);

    return NextResponse.json({ success: true, expiresAt, sendResult });
  } catch (err) {
    console.error('error handling',err);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}


  

//scaffold the personal-data form page so it directly uses app/components/ui/* and includes:

// shadcn Form, Input, Date Picker

// Validation

// sonner notifications

// Save progress temporarily in backend so users can resume later