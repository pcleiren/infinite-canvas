import { SITE_ACCESS_COOKIE } from "../lib/site-session";

export default {
  fetch(request: Request): Response {
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
  },
};
