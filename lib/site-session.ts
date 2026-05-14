const enc = new TextEncoder();

/** HttpOnly cookie name set by `/api/login`. */
export const SITE_ACCESS_COOKIE = "site_access";

/** Session length (ms). */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

function fromBase64Url(s: string): ArrayBuffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out.buffer;
}

export function timingSafeEqualUtf8(a: string, b: string): boolean {
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

export async function createAccessToken(password: string, ttlMs: number): Promise<string> {
  const exp = Date.now() + ttlMs;
  const message = String(exp);
  const key = await hmacKeyFromPassword(password);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return `${message}.${toBase64Url(sig)}`;
}

export async function verifyAccessToken(token: string | undefined, password: string): Promise<boolean> {
  if (!token || !password) {
    return false;
  }
  const dot = token.indexOf(".");
  if (dot < 1) {
    return false;
  }
  const message = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);
  const exp = Number(message);
  if (!Number.isFinite(exp) || Date.now() > exp) {
    return false;
  }
  let sigBuf: ArrayBuffer;
  try {
    sigBuf = fromBase64Url(sigPart);
  } catch {
    return false;
  }
  const key = await hmacKeyFromPassword(password);
  try {
    return await crypto.subtle.verify("HMAC", key, sigBuf, enc.encode(message));
  } catch {
    return false;
  }
}
