// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export async function middleware(req: any) {
//   const token = await getToken({ req });
//   const { pathname } = req.nextUrl;

//   if (!token && pathname.startsWith("/dashboard")) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/app/config/auth";

// Adjust based on your authentication system
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Example: You may store user info in cookies or session
    const role = session?.user?.role;

    if (!role || role !== "Admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized"; // Redirect to an unauthorized page
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // apply middleware to all admin routes
};

