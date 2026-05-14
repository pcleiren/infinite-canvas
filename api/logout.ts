const SITE_ACCESS_COOKIE = "site_access";

function handleLogout(request: Request): Response {
  if (request.method !== "POST" && request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const secure = process.env.VERCEL === "1" ? "; Secure" : "";
  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": `${SITE_ACCESS_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
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
