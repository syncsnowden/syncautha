import { getProjects, loadProjectData } from "@/lib/pastefy";
import { createClient } from "@/lib/supabase/server";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const { data: { user } } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

    const allProjects = await getProjects();
    const projects = user ? allProjects.filter(p => p.owner_id === user.id || !p.owner_id) : allProjects.filter(p => !p.owner_id);

    let activeKeys = 0;
    let totalUsers = 0;
    let totalExecutions = 0;
    let totalBlocked = 0;

    const dailyMap: Record<string, number> = {};

    for (const p of projects) {
      if (!p.paste_id) continue;
      const data = await loadProjectData(p.paste_id);
      if (data) {
        if (data.keys) {
          Object.values(data.keys).forEach((k: any) => {
            if (k.status === "used" || k.hwid) {
              activeKeys++;
            }
          });
        }
        if (data.users) {
          totalUsers += Object.keys(data.users).length;
        }
        if (data.executions_count) {
          totalExecutions += data.executions_count;
        }
        if (data.daily_executions) {
          for (const [date, count] of Object.entries(data.daily_executions)) {
            dailyMap[date] = (dailyMap[date] || 0) + (count as number);
          }
        }
      }
    }

    // Prepare chart data for the last 30 days
    const chartData: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      chartData.push({
        date: label,
        count: dailyMap[dateStr] || 0
      });
    }

    // Fetch plan
    let plan = "Free";
    try {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.replace("Bearer ", "").trim();
      if (token) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { persistSession: false } }
        );
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.user_metadata?.redeemed_code) {
          plan = user.user_metadata.redeemed_code;
        }
      }
    } catch {}

    const maxKeys = plan === "Pro" ? 2000 : (plan === "Basic" ? 500 : 200);

    return Response.json({
      activeKeys,
      maxKeys,
      plan,
      totalUsers,
      executions: totalExecutions,
      blocked: totalBlocked,
      chartData
    });
  } catch (e: any) {
    console.error("[GET /api/dashboard/stats] Error:", e);
    return Response.json({ error: e.message || "Failed to load stats" }, { status: 500 });
  }
}
