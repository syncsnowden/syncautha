import { getProjects, getRewardSession } from "@/lib/pastefy";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";

    // Full project settings dump
    const projects = await getProjects();
    const projectSummary = projects.map(p => ({
      id: p.id,
      name: p.name,
      checkpoint_steps: p.checkpoint_steps,
      lootlabs_link: p.lootlabs_link ? p.lootlabs_link.slice(0, 40) + "..." : "",
      ll_link_2: p.ll_link_2 ? p.ll_link_2.slice(0, 40) + "..." : "",
      ll_link_3: p.ll_link_3 ? p.ll_link_3.slice(0, 40) + "..." : "",
      lootlabs_api_key: p.lootlabs_api_key ? "SET" : "NOT SET",
    }));

    // Optionally look up a session by token
    let sessionInfo = null;
    if (token) {
      const s = await getRewardSession(token);
      sessionInfo = s ? { id: s.id, step: s.step, total_steps: s.total_steps, status: s.status, used: s.used } : "NOT FOUND";
    }

    return Response.json({ projects: projectSummary, session: sessionInfo });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
