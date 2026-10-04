import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/server/db";
import { hashToken, sessionCookie } from "@/server/auth";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  if (
    typeof body.cardID !== "string" ||
    !body.cardID.trim() ||
    body.cardID.length > 128
  )
    return NextResponse.json({ error: "Kart numaranı gir." }, { status: 400 });
  return withDB(async (db) => {
    const key = hashToken(body.cardID.trim()),
      now = Date.now();
    // Per-card throttling persists across processes and does not depend on spoofable IP headers.
    await db.run(
      `INSERT INTO login_attempts(key,count,resetAt) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN resetAt < ? THEN 1 ELSE count+1 END, resetAt = CASE WHEN resetAt < ? THEN excluded.resetAt ELSE resetAt END`,
      [key, now + 900000, now, now],
    );
    const attempt = await db.get(
      "SELECT count FROM login_attempts WHERE key = ?",
      key,
    );
    if (attempt.count > 10)
      return NextResponse.json(
        { error: "Çok fazla deneme. 15 dakika sonra tekrar dene." },
        { status: 429 },
      );
    const user = await db.get(
      "SELECT uid FROM users WHERE cardID = ?",
      body.cardID.trim(),
    );
    if (!user)
      return NextResponse.json(
        {
          error:
            "Kart bulunamadı. Okul sorumlundan kart kaydını kontrol etmesini iste.",
        },
        { status: 401 },
      );
    const token = randomBytes(32).toString("hex"),
      expires = now + 7 * 86400000;
    await db.run("DELETE FROM sessions WHERE expiresAt <= ?", now);
    await db.run(
      "INSERT INTO sessions(tokenHash,uid,expiresAt) VALUES (?,?,?)",
      [hashToken(token), user.uid, expires],
    );
    const response = NextResponse.json({ success: true });
    response.cookies.set(sessionCookie, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 86400,
    });
    return response;
  });
}
export async function DELETE(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 403 });
  const token = req.cookies.get(sessionCookie)?.value;
  if (token)
    await withDB((db) =>
      db.run("DELETE FROM sessions WHERE tokenHash = ?", hashToken(token)),
    );
  const response = NextResponse.json({ success: true });
  response.cookies.delete(sessionCookie);
  return response;
}
