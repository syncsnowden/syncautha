import { getKey, updateKey, deleteKey, hashHwid, getProject, logUser } from "@/lib/pastefy";
export const runtime = "edge";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, hwid, username, display_name, executor } = body;
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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               req.headers.get("x-real-ip") || 
               "127.0.0.1";

    const userPayload = {
      key,
      ip,
      username: username || "RobloxPlayer",
      display_name: display_name || "RobloxPlayer",
      executor: executor || "Unknown"
    };

    if (!entry.hwid) {
      await updateKey(key, (k) => { k.hwid = hashed; k.status = "used"; });
      await logUser(entry.project_id, hashed, userPayload);
      return Response.json({ status: "valid", reason: "HWID bound." });
    }

    if (entry.hwid === hashed) {
      await logUser(entry.project_id, hashed, userPayload);
      return Response.json({ status: "valid", reason: "Authorized." });
    }

    if (project.allow_hwid_reset) {
      await updateKey(key, (k) => { k.hwid = hashed; });
      await logUser(entry.project_id, hashed, userPayload);
      return Response.json({ status: "valid", reason: "HWID reset." });
    }

    return Response.json({ status: "hwid_mismatch", reason: "HWID mismatch." });
  } catch { return Response.json({ status: "error", reason: "Internal error." }, { status: 500 }); }
}
