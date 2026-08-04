interface UserResponse {
  nick?: string;
  nickname?: string;
}

function isUserResponse(value: unknown): value is UserResponse {
  if (typeof value !== "object" || value === null) return false;
  return (
    ("nick" in value && (typeof value.nick === "string" || value.nick === undefined)) ||
    ("nickname" in value && (typeof value.nickname === "string" || value.nickname === undefined))
  );
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, init);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response;
}

export async function getCurrentUserName(): Promise<string | null> {
  const user: unknown = await request("/api/auth/me").then((response) => response.json());
  return isUserResponse(user) ? (user.nick ?? user.nickname ?? null) : null;
}

export async function logout(): Promise<void> {
  await request("/api/auth/logout", { method: "POST" });
}
