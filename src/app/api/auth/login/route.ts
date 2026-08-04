import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept either 'identifier' or fallback 'email' field from legacy payloads
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
      try {
        const admin = createAdminClient();
        const { data } = await admin.auth.admin.listUsers();
        if (data?.users) {
          const match = data.users.find(
            (u) =>
              u.user_metadata?.username?.toLowerCase() === targetEmail.toLowerCase() ||
              u.user_metadata?.display_name?.toLowerCase() === targetEmail.toLowerCase()
          );
          if (match && match.email) {
            targetEmail = match.email;
          }
        }
      } catch (adminErr) {
        console.warn("Username lookup warning:", adminErr);
      }
    }

    const supabase = await createClient();

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

    return NextResponse.json(
      { success: true, user: { id: data.user.id, email: data.user.email } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
