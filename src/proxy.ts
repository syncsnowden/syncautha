import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/keys", "/users", "/profile", "/projects", "/rewards", "/docs"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth routes, static files, api routes
  if (
    pathname.startsWith("/api/") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/tos" ||
    pathname === "/key-system" ||
    pathname.startsWith("/get-key/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED.some((r) => pathname.startsWith(r));
  const isLoggedIn = request.cookies.get("syncauth_logged_in")?.value === "1";

  if (isProtected && !isLoggedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login/register
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|syncauthlogo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
