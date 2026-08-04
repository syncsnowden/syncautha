export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.identifier || body.email || "";
    const password = body.password || "";
    const remember = body.remember || false;

    if (!email || !password) {
      return Response.json({ error: "Email and password required." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey!,
      },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      return Response.json(
        { error: authData.error_description || "Invalid credentials." },
        { status: 401 }
      );
    }

    const maxAge = remember ? 30 * 24 * 60 * 60 : undefined;

    const res = Response.json(
      { success: true, user: { id: authData.user.id, email: authData.user.email } },
      { status: 200 }
    );

    if (authData.access_token) {
      res.headers.append("Set-Cookie", `sb-access-token=${authData.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax${maxAge ? `; Max-Age=${maxAge}` : ""}`);
    }
    if (authData.refresh_token) {
      res.headers.append("Set-Cookie", `sb-refresh-token=${authData.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax${maxAge ? `; Max-Age=${maxAge}` : ""}`);
    }
    if (remember) {
      res.headers.append("Set-Cookie", `syncauth-remember=true; Path=/; SameSite=Lax; Max-Age=${maxAge}`);
    }

    return res;
  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
