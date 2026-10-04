import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import type { Database } from "sqlite";
export const sessionCookie = "forest-session";
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function deviceAuthorized(req: NextRequest) {
  const keys = (process.env.API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return keys.includes(req.headers.get("x-api-key") || "");
}
export async function currentUser(req: NextRequest, db: Database) {
  const token = req.cookies.get(sessionCookie)?.value;
  if (!token) return undefined;
  return db.get<{
    uid: string;
    displayName: string;
    createdAt: string;
    schoolId: string;
  }>(
    "SELECT u.uid, u.displayName, u.createdAt, u.schoolId FROM sessions s JOIN users u ON u.uid = s.uid WHERE s.tokenHash = ? AND s.expiresAt > ?",
    [hashToken(token), Date.now()],
  );
}
