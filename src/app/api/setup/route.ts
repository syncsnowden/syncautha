import { getDB, getPasteId } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET() {
  await getDB();
  const pid = getPasteId();
  return Response.json({
    paste_id: pid,
    instructions: "Add this env var to Vercel: PASTEFY_PASTE_ID=" + pid,
  });
}
