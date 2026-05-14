import { next, rewrite } from "@vercel/functions";
import { SITE_ACCESS_COOKIE, verifyAccessToken } from "./lib/site-session";

/** Alleen deze paden door Edge Middleware — voorkomt tweede pass op /index.html na rewrite. */
export const config = {
  matcher: ["/", "/login", "/login/:path*", "/index.html"],
};

const LOGIN_SPA_HEADER = "x-login-spa";

function getPassword(): string | undefined {
  return (
    process.env.SITE_BASIC_AUTH_PASSWORD?.trim() ||
    process.env.BASIC_AUTH_PASSWORD?.trim() ||
    process.env.VERCEL_BASIC_AUTH_PASSWORD?.trim()
  );
}

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
  const pwd = getPassword();
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/index.html" && request.headers.get(LOGIN_SPA_HEADER) === "1") {
    return next();
  }

  if (!pwd) {
    if (path === "/login" || path.startsWith("/login/")) {
      return rewriteLoginToIndex(request);
    }
    return next();
  }

  if (path === "/index.html") {
    const t = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
    if (await verifyAccessToken(t, pwd)) {
      return next();
    }
    return Response.redirect(new URL("/login", request.url).href, 302);
  }

  if (path === "/login" || path.startsWith("/login/")) {
    const loginToken = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
    if (await verifyAccessToken(loginToken, pwd)) {
      return Response.redirect(new URL("/", request.url).href, 302);
    }
    return rewriteLoginToIndex(request);
  }

  const token = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
  if (await verifyAccessToken(token, pwd)) {
    return next();
  }

  return Response.redirect(new URL("/login", request.url).href, 302);
}
