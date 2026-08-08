import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getUserObfuscationUsage } from "@/lib/pastefy";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const usageInfo = await getUserObfuscationUsage(user);
    return Response.json(usageInfo);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
