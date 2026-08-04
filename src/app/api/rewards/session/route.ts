import { getRewardSession, createRewardSession, generateId } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pid = body.project_id;
    if (!pid) return Response.json({ error: "project_id required" }, { status: 400 });
    const sid = generateId(14);
    await createRewardSession(pid, { id: sid, project_id: pid, status: "pending", created: Date.now(), used: false });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const postbackUrl = `${siteUrl}/api/rewards/postback?sid=${sid}`;
    return Response.json({ session_id: sid, postback_url: postbackUrl });
  } catch (e: any) { return Response.json({ error: e.message }, { status: 500 }); }
}
