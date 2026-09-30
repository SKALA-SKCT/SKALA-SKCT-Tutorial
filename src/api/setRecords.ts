export interface SetRecord {
  id: string;
  setId: string;
  answers: Record<string, number>;
  createdAt: string;
}

function isSetRecord(value: unknown): value is SetRecord {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "setId" in value &&
    typeof value.setId === "string" &&
    "createdAt" in value &&
    typeof value.createdAt === "string" &&
    "answers" in value &&
    typeof value.answers === "object" &&
    value.answers !== null
  );
}

export async function getSetRecords(): Promise<SetRecord[]> {
  const response = await fetch("/api/set-records");
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const body: unknown = await response.json();
  return Array.isArray(body) ? body.filter(isSetRecord) : [];
}

export async function saveSetRecord(
  setId: string,
  answers: Record<string, number>,
): Promise<SetRecord> {
  const response = await fetch("/api/set-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ setId, answers }),
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const body: unknown = await response.json();
  if (!isSetRecord(body)) throw new Error("Invalid record response");
  return body;
}
