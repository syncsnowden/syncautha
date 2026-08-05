import { setup } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mid = await setup();
    const apiKey = process.env.PASTEFY_API_KEY || "sMBc9KgDW5Jy0PlP5GWCAa4Tlt4VJwJ2BQWJxW46NsLTYHEQbs3u4i8TyI4O";
    const res = await fetch(`https://pastefy.app/api/v2/paste/${mid}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    const content = data.paste?.content || data.content || "{}";
    const parsed = JSON.parse(content);
    return Response.json({
      paste_id: mid,
      project_count: Object.keys(parsed.projects || {}).length,
      projects: parsed.projects,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
