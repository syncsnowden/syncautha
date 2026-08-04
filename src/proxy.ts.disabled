import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return supabaseResponse;
    }

    const pathname = request.nextUrl.pathname;
    if (
      pathname.startsWith("/api/auth") ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password"
    ) {
      return supabaseResponse;
    }

    const isRemembered = request.cookies.get("syncauth-remember")?.value === "true";

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              try {
                request.cookies.set(name, value);
              } catch {
                // Ignore
              }
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                const opts = { ...options };
                if (isRemembered) {
                  opts.maxAge = 30 * 24 * 60 * 60; // 30 days
                  if (opts.expires) {
                    opts.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  }
                }
                supabaseResponse.cookies.set(name, value, opts);
              } catch {
                // Ignore
              }
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users away from protected routes
    const protectedRoutes = ["/dashboard", "/keys", "/users", "/profile"];
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

    if (isProtected && !user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    const authRoutes = ["/login", "/register", "/forgot-password"];
    const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

    if (isAuthRoute && user) {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashUrl);
    }
  } catch (err) {
    console.error("Middleware caught error:", err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|syncauthlogo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
