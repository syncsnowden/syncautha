import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse({
      email: body.identifier || body.email || "",
      password: body.password,
      remember: body.remember,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, remember } = parsed.data;
    const supabase = await createClient({ remember });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[login] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, user: { id: data.user.id, email: data.user.email } },
      { status: 200 }
    );

    if (remember) {
      response.cookies.set("syncauth-remember", "true", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });
    } else {
      response.cookies.set("syncauth-remember", "false", {
        path: "/",
        maxAge: 0,
        sameSite: "lax",
      });
    }

    return response;
  } catch (err) {
    console.error("Login Route Catch:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
