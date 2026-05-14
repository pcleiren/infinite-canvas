import { getSitePasswordCandidates, normalizeSecret } from "../lib/auth-env";
import {
  SITE_ACCESS_COOKIE,
  SESSION_TTL_MS,
  createAccessToken,
  timingSafeEqualUtf8,
} from "../lib/site-session";

/** Vercel Node functions expect `export default { fetch }`, not a bare async function. */
export default {
  async fetch(request: Request): Promise<Response> {
    const candidates = getSitePasswordCandidates();
    if (candidates.length === 0) {
      return Response.json(
        {
          ok: false,
          error:
            "No site password is configured. Set SITE_ACCESS_PASSWORD, SITE_BASIC_AUTH_PASSWORD, BASIC_AUTH_PASSWORD, or VERCEL_BASIC_AUTH_PASSWORD.",
        },
        { status: 503 }
      );
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const raw =
      typeof body === "object" && body !== null && "password" in body
        ? String((body as { password: unknown }).password)
        : "";
    const password = normalizeSecret(raw);

    let matched: string | undefined;
    for (const c of candidates) {
      if (timingSafeEqualUtf8(password, c)) {
        matched = c;
        break;
      }
    }

    if (!matched) {
      return Response.json({ ok: false, error: "Incorrect password." }, { status: 401 });
    }

    const token = await createAccessToken(matched, SESSION_TTL_MS);
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
  },
};
