import { getKey, updateKey, deleteKey, hashHwid, getProject } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, hwid } = body;
    if (!key || !hwid) return Response.json({ error: "key and hwid required" }, { status: 400 });

    const entry = await getKey(key);
    if (!entry) return Response.json({ status: "invalid", reason: "Key does not exist." });
    if (Date.now() > entry.expires) {
      await deleteKey(key);
      return Response.json({ status: "expired", reason: "Key has expired." });
    }

    const project = await getProject(entry.project_id);
    if (!project) return Response.json({ status: "invalid", reason: "Project not found." });

    const hashed = hashHwid(hwid);

    if (entry.hwid === null) {
      await updateKey(key, (k) => { k.hwid = hashed; k.status = "used"; });
      return Response.json({ status: "valid", reason: "HWID bound." });
    }

    if (entry.hwid === hashed) {
      return Response.json({ status: "valid", reason: "Authorized." });
    }

    if (project.allow_hwid_reset) {
      await updateKey(key, (k) => { k.hwid = hashed; });
      return Response.json({ status: "valid", reason: "HWID reset." });
    }

    return Response.json({ status: "hwid_mismatch", reason: "HWID mismatch." });
  } catch { return Response.json({ status: "error", reason: "Internal error." }, { status: 500 }); }
}
