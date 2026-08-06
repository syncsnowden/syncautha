import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const plan = user.user_metadata?.redeemed_code || "Free";
    const limit = plan === "Pro" ? 500 : (plan === "Basic" ? 50 : 10);
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const usageKey = `obf_usage_${currentMonth}`;
    const used = user.user_metadata?.[usageKey] || 0;

    return Response.json({ used, limit, plan });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
