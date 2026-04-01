import { NextResponse } from "next/server";

const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }
  if (pathname === "/") return NextResponse.next();

  const token = request.cookies.get("token")?.value;
  if (!token && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/).*)"],
};
