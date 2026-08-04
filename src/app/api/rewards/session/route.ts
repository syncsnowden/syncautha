import { getDB, updateDB, generateId } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project_id = body.project_id;
    if (!project_id) return Response.json({ error: "project_id required" }, { status: 400 });

    const db = await getDB();
    if (!db.projects[project_id]) return Response.json({ error: "Project not found" }, { status: 404 });

    const sessionId = generateId(14);
    await updateDB((d) => {
      d.rewards[sessionId] = {
        id: sessionId,
        project_id,
        status: "pending",
        created: Date.now(),
        used: false,
      };
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://syncauth-eight.vercel.app";
    const rewardUrl = `${siteUrl}/api/rewards/postback?sid=${sessionId}`;

    return Response.json({
      session_id: sessionId,
      reward_url: rewardUrl,
    });
  } catch {
    return Response.json({ error: "Failed to create session." }, { status: 500 });
  }
}
