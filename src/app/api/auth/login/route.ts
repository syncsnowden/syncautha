import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.identifier || body.email || "";
    const password = body.password || "";
    const remember = body.remember || false;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey!,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      return NextResponse.json(
        { error: authData.error_description || authData.msg || "Invalid credentials." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, user: { id: authData.user.id, email: authData.user.email } },
      { status: 200 }
    );

    const maxAge = remember ? 30 * 24 * 60 * 60 : undefined;

    if (authData.access_token) {
      response.cookies.set("sb-access-token", authData.access_token, {
        path: "/",
        maxAge,
        sameSite: "lax",
        httpOnly: true,
        secure: true,
      });
    }
    if (authData.refresh_token) {
      response.cookies.set("sb-refresh-token", authData.refresh_token, {
        path: "/",
        maxAge,
        sameSite: "lax",
        httpOnly: true,
        secure: true,
      });
    }

    if (remember) {
      response.cookies.set("syncauth-remember", "true", { path: "/", maxAge, sameSite: "lax" });
    }

    return response;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
