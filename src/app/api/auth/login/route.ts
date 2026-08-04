import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const schema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdentifier = body.identifier || body.email || "";
    const parsed = schema.safeParse({
      identifier: rawIdentifier,
      password: body.password,
      remember: body.remember,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    let targetEmail = identifier.trim();

    // If user provided a username instead of an email (no '@' character)
    if (!targetEmail.includes("@")) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        try {
          const admin = createAdminClient();
          if (admin && admin.auth && admin.auth.admin) {
            const { data, error: adminErr } = await admin.auth.admin.listUsers();
            if (!adminErr && data?.users) {
              const match = data.users.find(
                (u) =>
                  u.user_metadata?.username?.toLowerCase() === targetEmail.toLowerCase() ||
                  u.user_metadata?.display_name?.toLowerCase() === targetEmail.toLowerCase()
              );
              if (match && match.email) {
                targetEmail = match.email;
              }
            }
          }
        } catch (err) {
          console.warn("Username search failed, attempting direct login:", err);
        }
      }
    }

    const { remember } = parsed.data;
    const supabase = await createClient({ remember });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: password,
    });

    if (error) {
      console.error("[login] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Invalid username, email, or password." },
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
        maxAge: 30 * 24 * 60 * 60, // 30 days
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
  } catch (err: any) {
    console.error("Login Route Catch:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
