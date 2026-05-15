import { buildClearAccessCookieHeader } from "../lib/auth-cookie";

function handleLogout(request: Request): Response {
  if (request.method !== "POST" && request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": buildClearAccessCookieHeader(),
      },
    }
  );
}

/** Vercel “other / Vite” functions expect a Web handler object, not a bare default function. */
export default {
  fetch(request: Request): Response {
    try {
      return handleLogout(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ ok: false, error: `Logout error: ${message}` }, { status: 500 });
    }
  },
};
