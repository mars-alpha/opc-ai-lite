import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "opc_session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/courses") {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/auth";
  loginUrl.search = "";
  loginUrl.searchParams.set("mode", "login");
  loginUrl.searchParams.set("returnTo", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/courses/:path*"]
};
