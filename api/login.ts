/**
 * Self-contained login handler (no `../lib` imports) so Vercel bundles all code
 * into the serverless function. Keep crypto logic aligned with `lib/site-session.ts`.
 */
const enc = new TextEncoder();
const SITE_ACCESS_COOKIE = "site_access";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeSecret(value: string): string {
  return value.replace(/^\uFEFF/, "").trim();
}

function getSitePasswordCandidates(): string[] {
  const raw = [
    process.env.SITE_ACCESS_PASSWORD,
    process.env.SITE_BASIC_AUTH_PASSWORD,
    process.env.BASIC_AUTH_PASSWORD,
    process.env.VERCEL_BASIC_AUTH_PASSWORD,
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of raw) {
    if (v === undefined || v === null) {
      continue;
    }
    const t = normalizeSecret(String(v));
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

function timingSafeEqualUtf8(a: string, b: string): boolean {
  const ae = enc.encode(a);
  const be = enc.encode(b);
  if (ae.length !== be.length) {
    return false;
  }
  let x = 0;
  for (let i = 0; i < ae.length; i++) {
    x |= ae[i]! ^ be[i]!;
  }
  return x === 0;
}

async function hmacKeyFromPassword(password: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return crypto.subtle.importKey("raw", digest, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createAccessToken(password: string, ttlMs: number): Promise<string> {
  const exp = Date.now() + ttlMs;
  const message = String(exp);
  const key = await hmacKeyFromPassword(password);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return `${message}.${toBase64Url(sig)}`;
}

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
