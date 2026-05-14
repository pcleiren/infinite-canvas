import {
  SITE_ACCESS_COOKIE,
  SESSION_TTL_MS,
  createAccessToken,
  timingSafeEqualUtf8,
} from "../lib/site-session";

function getPassword(): string | undefined {
  return (
    process.env.SITE_BASIC_AUTH_PASSWORD?.trim() ||
    process.env.BASIC_AUTH_PASSWORD?.trim() ||
    process.env.VERCEL_BASIC_AUTH_PASSWORD?.trim()
  );
}

export default async function handler(request: Request): Promise<Response> {
  const pwd = getPassword();
  if (!pwd) {
    return Response.json({ ok: false, error: "SITE_BASIC_AUTH_PASSWORD is not configured." }, { status: 503 });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ongeldige JSON." }, { status: 400 });
  }

  const password = typeof body === "object" && body !== null && "password" in body ? String((body as { password: unknown }).password) : "";

  if (!timingSafeEqualUtf8(password, pwd)) {
    return Response.json({ ok: false, error: "Onjuist wachtwoord." }, { status: 401 });
  }

  const token = await createAccessToken(pwd, SESSION_TTL_MS);
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secure = process.env.VERCEL === "1" ? "; Secure" : "";

  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": `${SITE_ACCESS_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
      },
    }
  );
}
