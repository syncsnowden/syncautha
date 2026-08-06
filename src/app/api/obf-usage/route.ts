import { createClient as createAdminClient } from "@supabase/supabase-js";

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

    const plan = user.user_metadata?.redeemed_code || "Free";
    const limit = plan === "Pro" ? 500 : (plan === "Basic" ? 50 : 10);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageKey = `obf_usage_${currentMonth}`;
    const used = user.user_metadata?.[usageKey] || 0;

    return Response.json({ used, limit, plan });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
