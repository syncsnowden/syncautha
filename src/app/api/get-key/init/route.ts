import { getProjects, getProject, createRewardSession, generateId } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    const host = req.headers.get("host") || "syncauth-eight.vercel.app";
    const origin = (req.headers.get("origin") || `https://${host}`).replace(/\/+$/, "").replace(/\/[^/]+$/, "");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

    let project = await getProject(slug);
    if (!project) {
      const projects = await getProjects();
      const found = projects.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug.toLowerCase())
        || projects.find(p => p.name.toLowerCase().includes(slug.toLowerCase()));
      if (found) project = await getProject(found.id);
    }
    if (!project) return Response.json({ error: "Project not found." }, { status: 404 });

    const sessionId = generateId(14);
    await createRewardSession(project.id, {
      id: sessionId, project_id: project.id,
      status: "pending", created: Date.now(), used: false,
    });

    return Response.json({
      project: { id: project.id, name: project.name },
      session_id: sessionId,
      checkpoint_url: project.lootlabs_link || "",
      postback_url: `${siteUrl}/api/rewards/postback?sid=${sessionId}`,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "Failed." }, { status: 500 });
  }
}
