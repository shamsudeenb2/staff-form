// import { NextResponse } from "next/server";
// import { prisma } from "@/components/lib/db";
// import bcrypt from "bcryptjs";

// import { serialize } from "cookie";

// /**
//  * Simple in-memory rate limiter for login attempts.
//  * For production use a persistent store (Redis) so rate-limiting works across processes.
//  */
// declare global {
//   // eslint-disable-next-line no-var
//   var __nipost_login_attempts__: Map<string, { count: number; first: number }> | undefined;
// }
// const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
// const MAX_ATTEMPTS = 6;

// function getAttemptsStore() {
//   if (!global.__nipost_login_attempts__) {
//     global.__nipost_login_attempts__ = new Map();
//   }
//   return global.__nipost_login_attempts__;
// }

// function incrementAttempts(key: string) {
//   const store = getAttemptsStore();
//   const now = Date.now();
//   const entry = store.get(key);
//   if (!entry) {
//     store.set(key, { count: 1, first: now });
//     return { count: 1, first: now };
//   }
//   // reset if window expired
//   if (now - entry.first > ATTEMPT_WINDOW_MS) {
//     store.set(key, { count: 1, first: now });
//     return { count: 1, first: now };
//   }
//   entry.count += 1;
//   store.set(key, entry);
//   return entry;
// }

// function resetAttempts(key: string) {
//   const store = getAttemptsStore();
//   store.delete(key);
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { email, password, remember } = body ?? {};

//     if (!email || !password) {
//       return NextResponse.json({ error: "email and password required" }, { status: 400 });
//     }

//     const clientIp = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").toString();
//     const key = `login:${email}:${clientIp}`;

//     // check rate limit
//     const store = getAttemptsStore();
//     const maybe = store.get(key);
//     if (maybe && Date.now() - maybe.first < ATTEMPT_WINDOW_MS && maybe.count >= MAX_ATTEMPTS) {
//       return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
//     }

//     const user = await prisma.user.findUnique({ where: { email } });

//     // avoid revealing whether user exists
//     if (!user || !user.password) {
//       incrementAttempts(key);
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       incrementAttempts(key);
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     // success
//     resetAttempts(key);

//     // sign JWT
//     const secret = process.env.JWT_SECRET;
//     if (!secret) {
//       console.error("JWT_SECRET not set");
//       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
//     }

//     const payload = { userId: user.id, email: user.email };
//     const expiresIn = remember ? "30d" : "8h";
//     const token = jwt.sign(payload, secret, { expiresIn });

//     // set cookie
//     const cookie = serialize("nipost_token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: remember ? 30 * 24 * 60 * 60 : 8 * 60 * 60,
//     });

//     // respond with user basic info (don't include sensitive fields)
//     const userPublic = {
//       id: user.id,
//       email: user.email,
//       phone: user.phone ?? null,
//     };

//     return NextResponse.json({ success: true, user: userPublic }, { status: 200, headers: { "Set-Cookie": cookie } });
//   } catch (err) {
//     console.error("Error in /api/login:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }


import NextAuth from "next-auth";
import { authOptions } from "@/app/config/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
