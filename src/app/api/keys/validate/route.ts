import { getDB, updateDB, hashHwid } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, hwid } = body;
    if (!key || !hwid) return Response.json({ error: "key and hwid required" }, { status: 400 });

    const db = await getDB();
    const entry = db.keys[key];
    if (!entry) return Response.json({ status: "invalid", reason: "Key does not exist." });
    if (Date.now() > entry.expires) {
      await updateDB((d) => { delete d.keys[key]; });
      return Response.json({ status: "expired", reason: "Key has expired." });
    }

    const project = db.projects[entry.project_id];
    if (!project) return Response.json({ status: "invalid", reason: "Project not found." });

    const hashed = hashHwid(hwid);

    if (entry.hwid === null) {
      await updateDB((d) => {
        d.keys[key].hwid = hashed;
        d.keys[key].status = "used";
      });
      return Response.json({ status: "valid", reason: "HWID bound successfully." });
    }

    if (entry.hwid === hashed) {
      return Response.json({ status: "valid", reason: "Authorized." });
    }

    if (project.allow_hwid_reset) {
      await updateDB((d) => { d.keys[key].hwid = hashed; });
      return Response.json({ status: "valid", reason: "HWID reset and re-bound." });
    }

    return Response.json({ status: "hwid_mismatch", reason: "HWID does not match bound device." });
  } catch {
    return Response.json({ status: "error", reason: "Internal error." }, { status: 500 });
  }
}
