import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API CORS
  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  // Handle Admin Authentication
  if (pathname.startsWith("/admin")) {
    const isAdminLogin = pathname === "/admin/login";
    const token = request.cookies.get("admin_token")?.value;

    let isValidToken = false;
    if (token) {
      try {
        await jwtVerify(token, secret);
        isValidToken = true;
      } catch {
        isValidToken = false;
      }
    }

    // If trying to access login page while already logged in, redirect to dashboard
    if (isAdminLogin && isValidToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // If trying to access protected admin routes without token, redirect to login
    if (!isAdminLogin && !isValidToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
