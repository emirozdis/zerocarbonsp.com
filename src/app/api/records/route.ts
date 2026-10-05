import { NextRequest, NextResponse } from "next/server";
import { withDB, baseline } from "@/server/db";
import { currentUser, deviceAuthorized } from "@/server/auth";
export const runtime = "nodejs";
import { co2Factors, waterFactors } from "@/lib/forest/impact";
export async function POST(req: NextRequest) {
  if (!deviceAuthorized(req))
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim" },
      { status: 401 },
    );
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
  const { cardUID, type, weight, eventId } = body;
  if (
    typeof cardUID !== "string" ||
    !cardUID.trim() ||
    ![0, 1, 2].includes(type) ||
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight < 0 ||
    weight > 10000 ||
    (eventId !== undefined &&
      (typeof eventId !== "string" || !eventId.trim() || eventId.length > 128))
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Geçersiz kart, atık türü, ağırlık veya olay kimliği",
      },
      { status: 400 },
    );
  }
  try {
    return await withDB(async (db) => {
      await db.exec("BEGIN IMMEDIATE");
      try {
        const user = await db.get(
          "SELECT uid, schoolId FROM users WHERE cardID = ?",
          cardUID.trim(),
        );
        if (!user) {
          await db.exec("ROLLBACK");
          return NextResponse.json(
            { success: false, error: "Kart kayıtlı değil" },
            { status: 404 },
          );
        }
        if (eventId) {
          const previous = await db.get(
            "SELECT * FROM records WHERE eventId = ?",
            eventId,
          );
          if (previous) {
            await db.exec("ROLLBACK");
            if (
              previous.cardID !== cardUID.trim() ||
              previous.weight !== weight ||
              previous.wasteType !== type
            )
              return NextResponse.json(
                {
                  success: false,
                  error: "Bu olay kimliği farklı bir kayda ait",
                },
                { status: 409 },
              );
            return NextResponse.json({
              success: true,
              duplicate: true,
              data: {
                recordId: previous.id,
                co2Emission: previous.co2Emission,
                waterFootprint: previous.waterFootprint,
                weight,
                wasteType: type,
              },
            });
          }
        }
        const co2Emission = weight * co2Factors[type],
          waterFootprint = weight * waterFactors[type];
        const result = await db.run(
          "INSERT INTO records(cardID,weight,co2Emission,waterFootprint,createdAt,wasteType,eventId,baselineWeight,baselineCO2,baselineWater,targetRatio,schoolId,rulesVersion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)",
          [
            cardUID.trim(),
            weight,
            co2Emission,
            waterFootprint,
            new Date().toISOString(),
            type,
            eventId || null,
            baseline.weight,
            baseline.co2,
            baseline.water,
            baseline.targetRatio,
            user.schoolId,
          ],
        );
        await db.run(
          "UPDATE users SET totalCO2 = totalCO2 + ?, totalWater = totalWater + ? WHERE uid = ?",
          [co2Emission, waterFootprint, user.uid],
        );
        await db.exec("COMMIT");
        return NextResponse.json({
          success: true,
          data: {
            recordId: result.lastID,
            co2Emission,
            waterFootprint,
            weight,
            wasteType: type,
          },
        });
      } catch (error) {
        await db.exec("ROLLBACK");
        throw error;
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Kayıt kaydedilemedi" },
      { status: 500 },
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    return await withDB(async (db) => {
      const me = await currentUser(req, db),
        device = deviceAuthorized(req);
      if (!me && !device)
        return NextResponse.json(
          { success: false, error: "Kartınla giriş yap" },
          { status: 401 },
        );
      const uid = req.nextUrl.searchParams.get("uid");
      if (uid) {
        if (!device && uid !== me?.uid)
          return NextResponse.json(
            { success: false, error: "Bu kayıtlar kişiye özeldir" },
            { status: 403 },
          );
        const user = await db.get(
          "SELECT uid,displayName,totalCO2,totalWater FROM users WHERE uid = ?",
          uid,
        );
        if (!user)
          return NextResponse.json(
            { success: false, error: "Kullanıcı bulunamadı" },
            { status: 404 },
          );
        const records = await db.all(
          "SELECT r.id,r.weight,r.co2Emission,r.waterFootprint,r.createdAt,r.wasteType FROM records r JOIN users u ON u.cardID = r.cardID WHERE u.uid = ? ORDER BY r.createdAt DESC",
          uid,
        );
        const aggregated: Record<
          number,
          { weight: number; co2: number; water: number }
        > = {
          0: { weight: 0, co2: 0, water: 0 },
          1: { weight: 0, co2: 0, water: 0 },
          2: { weight: 0, co2: 0, water: 0 },
        };
        for (const record of records) {
          aggregated[record.wasteType].weight += record.weight;
          aggregated[record.wasteType].co2 += record.co2Emission;
          aggregated[record.wasteType].water += record.waterFootprint;
        }
        return NextResponse.json(
          {
            success: true,
            data: { user, records, aggregated, recordCount: records.length },
          },
          { headers: { "Cache-Control": "private, no-store" } },
        );
      }
      const users = await db.all(
        `WITH daily AS (
          SELECT cardID, substr(createdAt, 1, 10) AS mealDate,
            SUM(weight) AS totalWaste, MAX(baselineWeight) AS baselineWeight
          FROM records GROUP BY cardID, substr(createdAt, 1, 10)
        )
         SELECT u.uid, u.displayName, u.totalCO2, u.totalWater,
          COUNT(d.mealDate) AS mealCount,
          COALESCE(SUM(d.totalWaste), 0) AS totalWaste,
          COALESCE(SUM(d.baselineWeight), 0) AS totalMealWeight
         FROM users u LEFT JOIN daily d ON d.cardID = u.cardID
         ${device ? "" : "WHERE u.schoolId = ?"}
         GROUP BY u.uid ORDER BY u.uid`,
        ...(device ? [] : [me!.schoolId]),
      );
      return NextResponse.json(
        { success: true, data: users, count: users.length },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Kayıtlar yüklenemedi" },
      { status: 500 },
    );
  }
}
