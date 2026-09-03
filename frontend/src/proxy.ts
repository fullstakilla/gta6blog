import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const isLogin = req.nextUrl.pathname === "/admin/login";
  const hasSession = req.cookies.has("gta6_session");

  if (!isLogin && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
