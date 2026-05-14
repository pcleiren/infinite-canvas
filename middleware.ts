import { next } from "@vercel/functions";

const DEFAULT_BASIC_USER = "eddie";

function basicAuthEnabled(): boolean {
  return Boolean(process.env.VERCEL_BASIC_AUTH_PASSWORD?.length);
}

function unauthorized(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

/** Geen matcher: alle routes (incl. assets) door middleware — nodig voor volledige Basic Auth. */
export default function middleware(request: Request): Response {
  if (!basicAuthEnabled()) {
    return next();
  }

  const expectedUser = process.env.VERCEL_BASIC_AUTH_USER ?? DEFAULT_BASIC_USER;
  const expectedPass = process.env.VERCEL_BASIC_AUTH_PASSWORD ?? "";

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }

  const colon = decoded.indexOf(":");
  if (colon === -1) {
    return unauthorized();
  }

  const user = decoded.slice(0, colon);
  const pass = decoded.slice(colon + 1);

  if (user === expectedUser && pass === expectedPass) {
    return next();
  }

  return unauthorized();
}
