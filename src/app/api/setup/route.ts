import { setup } from "@/lib/pastefy";

export const dynamic = "force-dynamic";

export async function GET() {
  const mid = await setup();
  return Response.json({
    master_paste_id: mid,
    instructions: "Add to Vercel env vars: PASTEFY_PASTE_ID=" + mid,
  });
}
