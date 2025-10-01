
import { NextResponse,NextRequest } from "next/server";
import { createOtpForPhone } from "@/components/lib/otp";
import { sendSms } from "@/components/lib/sms";
import { prisma } from "@/components/lib/db";



// const otpRequests: Record<string, { count: number; lastRequest: number }> = {};

export async function POST(req: NextRequest) {
  
  try {
    const { validatePhone } = await req.json();
    console.log("lets see the phone", validatePhone)
    
  if (!validatePhone) return NextResponse.json({ error: "validatePhone required" }, { status: 400 });

    // check existing validated user
    const user = await prisma.user.findUnique({ 
      where: { phone: validatePhone } 
    });

     if (user && user.done) return NextResponse.json({ done: true });
  
    if (user && user.phoneVerified) return NextResponse.json({ verified: true });

   



    // const phoneNumber = "+234".concat(validatePhone)
    const { code, expiresAt } = await createOtpForPhone(validatePhone);
    const message = `Your NIPOST OTP is: ${code} (valid 5 minutes)`;
    const sentResult = await sendSms(validatePhone, message);

    if(sentResult){
      return NextResponse.json({ success: true, expiresAt, sentResult });
    }
    return NextResponse.json({ success: false, expiresAt, sentResult }, { status: 500 });
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