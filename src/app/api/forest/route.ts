import { studentDisplayName } from "@/lib/forest/student-label";
import { NextRequest, NextResponse } from "next/server";
import { withDB, baseline } from "@/server/db";
import { currentUser } from "@/server/auth";
import {
  dailyMeals,
  growPlant,
  summarize,
  type MealEvent,
} from "@/lib/forest/model";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    return await withDB(async (db) => {
      const me = await currentUser(req, db);
      if (!me)
        return NextResponse.json(
          { error: "Ormanına girmek için kartınla giriş yap." },
          { status: 401 },
        );
      const school = await db.get(
        "SELECT id, name FROM schools WHERE id = ?",
        me.schoolId,
      );
      const users = await db.all<
        {
          uid: string;
          displayName: string;
          createdAt: string;
          plotIndex: number;
        }[]
      >(
        "SELECT uid, displayName, createdAt, plotIndex FROM users WHERE schoolId = ? ORDER BY createdAt, uid",
        me.schoolId,
      );
      const records = await db.all<(MealEvent & { uid: string })[]>(
        "SELECT r.*, u.uid FROM records r JOIN users u ON u.cardID = r.cardID WHERE u.schoolId = ? ORDER BY r.createdAt, r.id",
        me.schoolId,
      );
      const byUser = new Map<string, MealEvent[]>();
      for (const record of records) {
        const list = byUser.get(record.uid) || [];
        list.push(record);
        byUser.set(record.uid, list);
      }
      const results = users.map((user) =>
        growPlant(user, dailyMeals(byUser.get(user.uid) || [])),
      );
      const own = results.find((r) => r.plant.uid === me.uid);
      const plants = results.map((r) => r.plant);
      // Peers get a first-name display and plant state, not raw meal history or card IDs.
      return NextResponse.json(
        {
          school,
          plants: plants.map((p) => ({
            ...p,
            name: p.uid === me.uid ? p.name : studentDisplayName(p.name),
            savedCO2: p.uid === me.uid ? p.savedCO2 : 0,
            savedWater: p.uid === me.uid ? p.savedWater : 0,
            savedFood: p.uid === me.uid ? p.savedFood : 0,
          })),
          me: own?.plant,
          history: own?.history.slice(0, 60),
          summary: summarize(plants),
          baseline,
          demo: false,
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Orman şu an yüklenemedi." },
      { status: 500 },
    );
  }
}
