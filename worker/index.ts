/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
}

const AUTH_ORIGIN = "https://www.skala-skct.com";

function methodNotAllowed(allowedMethod: "GET" | "POST"): Response {
  return Response.json(
    { error: "method_not_allowed" },
    {
      status: 405,
      headers: { Allow: allowedMethod },
    },
  );
}

async function proxyAuthRequest(request: Request, pathname: string): Promise<Response> {
  const headers = new Headers();
  const cookie = request.headers.get("Cookie");
  if (cookie) headers.set("Cookie", cookie);

  try {
    return await fetch(new URL(pathname, AUTH_ORIGIN), {
      method: request.method,
      headers,
      redirect: "manual",
    });
  } catch {
    return Response.json({ error: "auth_service_unavailable" }, { status: 502 });
  }
}

/**
 * The Worker serves the static React app and exposes same-origin authentication
 * endpoints. Authentication itself remains owned by the mother service; the
 * tutorial forwards the shared parent-domain session cookie for verification.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/health") {
        return Response.json({ status: "ok" });
      }

      if (url.pathname === "/api/auth/me") {
        if (request.method !== "GET") return methodNotAllowed("GET");
        return proxyAuthRequest(request, url.pathname);
      }

      if (url.pathname === "/api/auth/logout") {
        if (request.method !== "POST") return methodNotAllowed("POST");
        return proxyAuthRequest(request, url.pathname);
      }

      // e.g. POST /api/tutorial -> call Claude, return generated steps
      return new Response("Not Found", { status: 404 });
    }

    // Non-API requests fall back to the static assets (SPA shell).
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
