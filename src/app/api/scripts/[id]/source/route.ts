import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    const { data: fileData, error } = await supabase.storage
      .from("scripts")
      .download(`raw/${id}.lua`);

    if (error || !fileData) {
      return new Response("Raw script source not found.", { status: 404, headers: { "Content-Type": "text/plain" } });
    }

    const rawText = await fileData.text();
    return new Response(rawText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
