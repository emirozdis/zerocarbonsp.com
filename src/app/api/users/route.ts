import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { withDB } from "@/server/db";
import { deviceAuthorized } from "@/server/auth";
export const runtime = "nodejs";
const unauthorized = () =>
  NextResponse.json(
    { success: false, error: "Yetkisiz erişim" },
    { status: 401 },
  );
export async function GET(req: NextRequest) {
  if (!deviceAuthorized(req)) return unauthorized();
  return withDB(async (db) => {
    const card = req.nextUrl.searchParams.get("cardID");
    const data = card
      ? await db.get(
          "SELECT uid,displayName,schoolId FROM users WHERE cardID = ?",
          card,
        )
      : await db.all(
          "SELECT uid,displayName,schoolId FROM users ORDER BY displayName",
        );
    return NextResponse.json(
      { success: !!data, data },
      { status: data ? 200 : 404 },
    );
  });
}
export async function POST(req: NextRequest) {
  if (!deviceAuthorized(req)) return unauthorized();
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Geçersiz JSON" },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object")
    return NextResponse.json(
      { success: false, error: "Geçersiz JSON" },
      { status: 400 },
    );
  const { cardID, displayName, schoolId = "default", schoolName } = body;
  if (
    typeof cardID !== "string" ||
    !cardID.trim() ||
    cardID.length > 128 ||
    typeof displayName !== "string" ||
    !displayName.trim() ||
    displayName.length > 80 ||
    typeof schoolId !== "string" ||
    !/^[a-zA-Z0-9_-]{1,80}$/.test(schoolId) ||
    (schoolName !== undefined &&
      (typeof schoolName !== "string" ||
        !schoolName.trim() ||
        schoolName.length > 120))
  )
    return NextResponse.json(
      { success: false, error: "Geçersiz öğrenci veya okul bilgisi" },
      { status: 400 },
    );
  try {
    return await withDB(async (db) => {
      await db.exec("BEGIN IMMEDIATE");
      try {
        if (schoolName)
          await db.run("INSERT OR IGNORE INTO schools(id,name) VALUES (?,?)", [
            schoolId,
            schoolName.trim(),
          ]);
        if (!(await db.get("SELECT id FROM schools WHERE id = ?", schoolId))) {
          await db.exec("ROLLBACK");
          return NextResponse.json(
            { success: false, error: "Okul bulunamadı; schoolName gerekli" },
            { status: 400 },
          );
        }
        const uid = randomUUID();
        await db.run(
          "INSERT INTO users(uid,cardID,displayName,schoolId,plotIndex) VALUES (?,?,?,?,(SELECT COALESCE(MAX(plotIndex),-1)+1 FROM users WHERE schoolId = ?))",
          [uid, cardID.trim(), displayName.trim(), schoolId, schoolId],
        );
        await db.exec("COMMIT");
        return NextResponse.json(
          {
            success: true,
            data: {
              uid,
              cardID: cardID.trim(),
              displayName: displayName.trim(),
              schoolId,
            },
          },
          { status: 201 },
        );
      } catch (error) {
        await db.exec("ROLLBACK");
        throw error;
      }
    });
  } catch (error) {
    const conflict = error instanceof Error && error.message.includes("UNIQUE");
    return NextResponse.json(
      {
        success: false,
        error: conflict ? "Kart zaten kayıtlı" : "Kayıt başarısız",
      },
      { status: conflict ? 409 : 500 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (!deviceAuthorized(req)) return unauthorized();
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid)
    return NextResponse.json(
      { success: false, error: "uid gerekli" },
      { status: 400 },
    );
  return withDB(async (db) => {
    await db.exec("BEGIN IMMEDIATE");
    try {
      await db.run(
        "DELETE FROM records WHERE cardID = (SELECT cardID FROM users WHERE uid = ?)",
        uid,
      );
      const result = await db.run("DELETE FROM users WHERE uid = ?", uid);
      await db.exec("COMMIT");
      return NextResponse.json(
        { success: !!result.changes },
        { status: result.changes ? 200 : 404 },
      );
    } catch (error) {
      await db.exec("ROLLBACK");
      throw error;
    }
  });
}
