import { getSitePasswordCandidates, normalizeSecret } from "../lib/auth-env";
import { buildSetAccessCookieHeader } from "../lib/auth-cookie";
import {
  createAccessToken,
  SESSION_TTL_MS,
  timingSafeEqualUtf8,
} from "../lib/site-session";

async function handleLogin(request: Request): Promise<Response> {
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

  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": buildSetAccessCookieHeader(token, maxAge),
      },
    }
  );
}

/** Vercel “other / Vite” functions expect a Web handler object, not a bare default function. */
export default {
  async fetch(request: Request): Promise<Response> {
    try {
      return await handleLogin(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ ok: false, error: `Login error: ${message}` }, { status: 500 });
    }
  },
};
