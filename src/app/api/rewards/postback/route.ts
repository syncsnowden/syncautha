import { getRewardSession, updateRewardSession, getProject } from "@/lib/pastefy";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid") || url.searchParams.get("click_id") || "";
  if (!sid) return Response.json({ error: "Missing sid" }, { status: 400 });
  
  const session = await getRewardSession(sid);
  if (!session) return Response.json({ error: "Not found" }, { status: 404 });

  const project = await getProject(session.project_id);
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

  const provider = project.reward_provider || "lootlabs";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get("host") || "syncauth-eight.vercel.app"}`;

  if (provider === "linkvertise") {
    // 1. Block known bypasser referer headers
    const referer = (req.headers.get("referer") || "").toLowerCase();
    const blockedReferers = ["bypass.city", "bypass.vip", "bypasser", "linkvertisebypasser", "keybypasser"];
    if (blockedReferers.some(r => referer.includes(r))) {
      return Response.json({ error: "Bypasser detected. Please complete the link honestly." }, { status: 403 });
    }

    // 2. Verify that the IP address matches the session's creator IP address
    const ip = req.headers.get("cf-connecting-ip") || 
               req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1";
    if (session.ip && session.ip !== ip) {
      return Response.json({ error: "IP address mismatch. You must complete the checkpoint on the same device and network connection. Bypassing is blocked." }, { status: 403 });
    }

    const hash = url.searchParams.get("hash") || "";
    if (!hash) return Response.json({ error: "Missing hash parameter. Did you bypass?" }, { status: 400 });

    const token = project.linkvertise_api_key || "";
    if (!token) return Response.json({ error: "Linkvertise API key is not configured for this project." }, { status: 400 });

    try {
      const lvRes = await fetch(`https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${token}&hash=${hash}`, {
        method: "POST"
      });
      const resText = await lvRes.text();
      if (!resText.toUpperCase().includes("TRUE")) {
        return Response.json({ error: "Linkvertise verification failed. Please complete the link honestly." }, { status: 400 });
      }
    } catch (e: any) {
      return Response.json({ error: "Linkvertise verification error: " + e.message }, { status: 500 });
    }

    const links = [project.linkvertise_link, project.lv_link_2, project.lv_link_3].filter(Boolean);
    const totalSteps = Math.max(links.length, 1);
    const nextStep = (session.step || 0) + 1;

    await updateRewardSession(project.id, sid, (s) => {
      s.step = nextStep;
      s.total_steps = totalSteps;
      if (nextStep >= totalSteps) {
        s.status = "completed";
      }
    });

    return Response.redirect(`${siteUrl}/get-key/${session.project_id}?token=${sid}&verified=true`);
  } else {
    await updateRewardSession(session.project_id, sid, (s) => { s.status = "completed"; });
    return Response.redirect(`${siteUrl}/get-key/${session.project_id}?token=${sid}`);
  }
}
