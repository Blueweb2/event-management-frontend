import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
  const userRole = request.cookies.get("user_role")?.value?.toLowerCase();

  const { pathname } = request.nextUrl;

  // Protect Manager routes
  if (pathname.startsWith("/manager")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Staff routes
  if (pathname.startsWith("/staff")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login" && token) {
    if (userRole === "manager") {
      return NextResponse.redirect(new URL("/manager", request.url));
    }
    if (userRole === "staff") {
      return NextResponse.redirect(new URL("/staff", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manager/:path*", "/staff/:path*", "/login"],
};
