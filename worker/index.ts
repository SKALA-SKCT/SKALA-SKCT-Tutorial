/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  SET_RECORDS: KVNamespace;
}

const AUTH_ORIGIN = "https://www.skala-skct.com";
const MAX_RECORDS_PER_USER = 300;
const MAX_ANSWERS_PER_RECORD = 20;
const SET_ID_PATTERN = /^[a-z]+(?:-[a-z]+)*-\d{1,2}$/;
const QUESTION_ID_PATTERN = /^[\w-]{1,80}$/;

interface SetRecord {
  id: string;
  setId: string;
  answers: Record<string, number>;
  createdAt: string;
}

function methodNotAllowed(allowedMethod: "GET" | "POST" | "GET, POST"): Response {
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

async function currentUserId(request: Request): Promise<string | null> {
  const response = await proxyAuthRequest(request, "/api/auth/me");
  if (!response.ok) return null;
  const user: unknown = await response.json().catch(() => null);
  if (typeof user !== "object" || user === null || !("sub" in user)) return null;
  return typeof user.sub === "string" && user.sub ? user.sub : null;
}

function parseAnswers(value: unknown): Record<string, number> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (entries.length > MAX_ANSWERS_PER_RECORD) return null;
  const valid = entries.every(
    ([questionId, choice]) =>
      QUESTION_ID_PATTERN.test(questionId) &&
      Number.isInteger(choice) &&
      choice >= 0 &&
      choice <= 4,
  );
  return valid ? Object.fromEntries(entries) : null;
}

async function readRecords(env: Env, userId: string): Promise<SetRecord[]> {
  const records = await env.SET_RECORDS.get<SetRecord[]>(`records:${userId}`, "json");
  return Array.isArray(records) ? records : [];
}

// ponytail: 사용자별 키 하나를 읽고 다시 쓰므로 같은 사용자의 동시 저장은 하나가 덮일 수 있습니다.
async function handleSetRecords(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") return methodNotAllowed("GET, POST");
  const userId = await currentUserId(request);
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });
  const records = await readRecords(env, userId);
  if (request.method === "GET") return Response.json(records);

  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || !("setId" in body) || !("answers" in body)) {
    return Response.json({ error: "invalid_record" }, { status: 400 });
  }
  const answers = parseAnswers(body.answers);
  if (typeof body.setId !== "string" || !SET_ID_PATTERN.test(body.setId) || !answers) {
    return Response.json({ error: "invalid_record" }, { status: 400 });
  }
  const record: SetRecord = {
    id: crypto.randomUUID(),
    setId: body.setId,
    answers,
    createdAt: new Date().toISOString(),
  };
  const next = [...records, record].slice(-MAX_RECORDS_PER_USER);
  await env.SET_RECORDS.put(`records:${userId}`, JSON.stringify(next));
  return Response.json(record, { status: 201 });
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

      if (url.pathname === "/api/set-records") {
        return handleSetRecords(request, env);
      }

      // e.g. POST /api/tutorial -> call Claude, return generated steps
      return new Response("Not Found", { status: 404 });
    }

    // Non-API requests fall back to the static assets (SPA shell).
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
