import { next, rewrite } from "@vercel/functions";
import { SITE_ACCESS_COOKIE, verifyAccessToken } from "./lib/site-session";

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

function isPublicAsset(pathname: string): boolean {
  if (pathname.startsWith("/assets/")) {
    return true;
  }
  if (pathname.startsWith("/artworks/")) {
    return true;
  }
  if (pathname === "/eddie-laan-hero.png" || pathname === "/vite.svg") {
    return true;
  }
  if (pathname.endsWith(".js") || pathname.endsWith(".css") || pathname.endsWith(".map")) {
    return true;
  }
  return false;
}

export default async function middleware(request: Request): Promise<Response> {
  const pwd = getPassword();
  const url = new URL(request.url);
  const path = url.pathname;

  if (!pwd) {
    if (path === "/login" || path.startsWith("/login/")) {
      return rewrite(new URL("/index.html", request.url));
    }
    return next();
  }

  if (path === "/api/login" || path === "/api/logout") {
    return next();
  }

  if (isPublicAsset(path)) {
    return next();
  }

  if (path === "/login" || path.startsWith("/login/")) {
    const loginToken = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
    if (await verifyAccessToken(loginToken, pwd)) {
      return Response.redirect(new URL("/", request.url).href, 302);
    }
    return rewrite(new URL("/index.html", request.url));
  }

  const token = parseCookieHeader(request.headers.get("cookie"), SITE_ACCESS_COOKIE);
  if (await verifyAccessToken(token, pwd)) {
    return next();
  }

  return Response.redirect(new URL("/login", request.url).href, 302);
}
