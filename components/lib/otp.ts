// lib/otp.ts
// import { prisma } from "./db";
// import { PrismaClient } from "@prisma/client";
// import { randomInt } from "crypto";
// import { addMinutes } from "date-fns";

// const prisma = new PrismaClient();

// export async function generateOTP(phone: string): Promise<string> {
//   const code = randomInt(100000, 999999).toString(); // 6-digit

//   await prisma.oTP.create({
//     data: {
//       phone,
//       code,
//       expiresAt: addMinutes(new Date(), 5), // expires in 5 mins
//     },
//   });

//   return code;
// }

// export async function verifyOTP(phone: string, code: string): Promise<boolean> {
//   const otp = await prisma.oTP.findFirst({
//     where: {
//       phone,
//       code,
//       verified: false,
//       expiresAt: { gte: new Date() },
//     },
//   });

//   if (!otp) return false;

//   await prisma.oTP.update({
//     where: { id: otp.id },
//     data: { verified: true },
//   });

//   // Mark phone as verified in User
//   await prisma.user.upsert({
//     where: { phone },
//     create: { phone, phoneVerified: true },
//     update: { phoneVerified: true },
//   });

//   return true;
// }

// lib/otp.ts
import { prisma } from "./db";
import { addMinutes } from "date-fns";

function generateSixDigit() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtpForPhone(phone: string) {
  const code = generateSixDigit();
  const expiresAt = addMinutes(new Date(), 5);

  await prisma.oTP.create({
    data: { phone, code, expiresAt, verified: false },
  });

  return { code, expiresAt };
}

export async function verifyOtpCode(phone: string, code: string) {
  const otp = await prisma.oTP.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;

  await prisma.oTP.update({ where: { id: otp.id }, data: { verified: true } });

  // ensure user exists and mark verified
  await prisma.user.upsert({
    where: { phone },
    create: { phone, phoneVerified: true },
    update: { phoneVerified: true },
  });

  return true;
}