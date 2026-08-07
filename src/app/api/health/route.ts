export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(JSON.stringify({ ok: true, time: Date.now(), build: "v6-jsondirect" }), {
    headers: { "content-type": "application/json" },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ ok: true, timestamp: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
