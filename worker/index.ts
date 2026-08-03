/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
}

/**
 * The Worker only needs to exist so this deploys as a Workers app (not Pages)
 * with room to grow. Today it serves the static React app; the `/api/*` branch
 * is where a future Claude-API endpoint for auto-generating tutorials would live.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/health") {
        return Response.json({ status: "ok" });
      }
      // e.g. POST /api/tutorial -> call Claude, return generated steps
      return new Response("Not Found", { status: 404 });
    }

    // Non-API requests fall back to the static assets (SPA shell).
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
