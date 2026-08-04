export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return new Response(JSON.stringify({ ok: true, time: Date.now() }), {
    headers: { "content-type": "application/json" },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ ok: true, timestamp: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
