import { SITE_ACCESS_COOKIE } from "./site-session";

export { SITE_ACCESS_COOKIE };

function secureCookieSuffix(): string {
  return process.env.VERCEL === "1" ? "; Secure" : "";
}

/** `Set-Cookie` value for a signed session token. */
export function buildSetAccessCookieHeader(token: string, maxAgeSeconds: number): string {
  return `${SITE_ACCESS_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureCookieSuffix()}`;
}

/** `Set-Cookie` value that clears the session cookie. */
export function buildClearAccessCookieHeader(): string {
  return `${SITE_ACCESS_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookieSuffix()}`;
}
