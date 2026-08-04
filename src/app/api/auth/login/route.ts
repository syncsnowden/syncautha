export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.identifier || body.email || "";
    const password = body.password || "";

    if (!email || !password) {
      return Response.json({ error: "Email and password required." }, { status: 400 });
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data.error_description || data.msg || "Invalid credentials." },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      user: { id: data.user.id, email: data.user.email },
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        expires_in: data.expires_in,
        token_type: data.token_type,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
