import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.identifier || body.email || "";
    const password = body.password || "";
    const remember = body.remember || false;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    let responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            responseCookies = cookiesToSet.map(({ name, value, options }) => ({
              name,
              value,
              options: {
                ...options,
                ...(remember ? { maxAge: 30 * 24 * 60 * 60 } : {}),
                sameSite: "lax" as const,
                secure: true,
              },
            }));
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, user: { id: data.user.id, email: data.user.email } },
      { status: 200 }
    );

    for (const c of responseCookies) {
      response.cookies.set(c.name, c.value, c.options as any);
    }

    response.cookies.set("syncauth-remember", remember ? "true" : "false", {
      path: "/",
      maxAge: remember ? 30 * 24 * 60 * 60 : 0,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
