import { next, rewrite } from "@vercel/functions";
import { getSitePasswordCandidates } from "./lib/auth-env.js";
import { SITE_ACCESS_COOKIE, verifyAccessTokenAny } from "./lib/site-session.js";

/**
 * Paths that run Edge Middleware. Include `/api/*` so we can immediately `next()`
 * to the serverless route — if matcher were ever skipped, `/api/login` would hit
 * auth redirects and break POST + JSON (client shows generic "Sign-in failed").
 */
export const config = {
  matcher: ["/api/:path*", "/", "/login", "/login/:path*", "/index.html"],
};

const LOGIN_SPA_HEADER = "x-login-spa";

function parseCookieHeader(header: string | null, name: string): string | undefined {
  if (!header) {
    return;
  }
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const k = part.slice(0, idx).trim();
    if (k !== name) {
      continue;
    }
    return decodeURIComponent(part.slice(idx + 1).trim());
  }
}

function rewriteLoginToIndex(request: Request): Response {
  const h = new Headers(request.headers);
  h.set(LOGIN_SPA_HEADER, "1");
  return rewrite(new URL("/index.html", request.url), { request: { headers: h } });
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path.startsWith("/api/")) {
    return next();
  }

  const candidates = getSitePasswordCandidates();

  if (path === "/index.html" && request.headers.get(LOGIN_SPA_HEADER) === "1") {
    return next();
  }

  if (candidates.length === 0) {
    if (path === "/login" || path.startsWith("/login/")) {
      return rewriteLoginToIndex(request);
    }
    return next();
  }

  if (path === "/index.html") {
    const t = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
    if (await verifyAccessTokenAny(t, candidates)) {
      return next();
    }
    return Response.redirect(new URL("/login", request.url).href, 302);
  }

  if (path === "/login" || path.startsWith("/login/")) {
    const loginToken = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
    if (await verifyAccessTokenAny(loginToken, candidates)) {
      return Response.redirect(new URL("/", request.url).href, 302);
    }
    return rewriteLoginToIndex(request);
  }

  const token = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
  if (await verifyAccessTokenAny(token, candidates)) {
    return next();
  }

  return Response.redirect(new URL("/login", request.url).href, 302);
}
