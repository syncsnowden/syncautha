export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const email = body.identifier || body.email || "";
  const password = body.password ? "***" : "";
  return Response.json({ test: true, email, passwordLength: password.length });
}
