import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";

function positiveEnv(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid ${name}`);
  return value;
}
export const baseline = {
  weight: positiveEnv("MEAL_WEIGHT_GRAMS", 450),
  co2: positiveEnv("MEAL_CO2_GRAMS", 1800),
  water: positiveEnv("MEAL_WATER_LITERS", 500),
  targetRatio: positiveEnv("MEAL_WASTE_TARGET_RATIO", 0.15),
};
let initialized: Promise<void> | undefined;
async function connect() {
  const db = await open({
    filename: process.env.DATABASE_PATH || "./database.sqlite",
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  return db;
}
async function initialize() {
  const db = await connect();
  try {
    await db.exec(`PRAGMA journal_mode = WAL; BEGIN IMMEDIATE;
      CREATE TABLE IF NOT EXISTS schools (id TEXT PRIMARY KEY, name TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, cardID TEXT UNIQUE NOT NULL, displayName TEXT NOT NULL, totalCO2 REAL DEFAULT 0, totalWater REAL DEFAULT 0, createdAt TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, cardID TEXT NOT NULL, weight REAL NOT NULL, co2Emission REAL NOT NULL, waterFootprint REAL NOT NULL, createdAt TEXT NOT NULL, wasteType INTEGER NOT NULL CHECK(wasteType IN (0,1,2)), FOREIGN KEY(cardID) REFERENCES users(cardID));
      CREATE TABLE IF NOT EXISTS sessions (tokenHash TEXT PRIMARY KEY, uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE, expiresAt INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_records_cardID ON records(cardID);
      CREATE INDEX IF NOT EXISTS idx_records_createdAt ON records(createdAt);
      CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, resetAt INTEGER NOT NULL);
    `);
    await db.run("INSERT OR IGNORE INTO schools(id, name) VALUES (?, ?)", [
      "default",
      process.env.SCHOOL_NAME || "Sıfır Karbon Okulu",
    ]);
    const userColumns = await db.all<{ name: string }[]>(
      "PRAGMA table_info(users)",
    );
    if (!userColumns.some((c) => c.name === "schoolId"))
      await db.exec(
        "ALTER TABLE users ADD COLUMN schoolId TEXT NOT NULL DEFAULT 'default'",
      );
    if (!userColumns.some((c) => c.name === "plotIndex")) {
      await db.exec("ALTER TABLE users ADD COLUMN plotIndex INTEGER");
      await db.exec(
        "UPDATE users SET plotIndex = rowid - 1 WHERE plotIndex IS NULL",
      );
    }
    const columns = await db.all<{ name: string }[]>(
      "PRAGMA table_info(records)",
    );
    for (const [name, definition] of Object.entries({
      eventId: "TEXT",
      baselineWeight: "REAL",
      baselineCO2: "REAL",
      baselineWater: "REAL",
      targetRatio: "REAL",
      schoolId: "TEXT",
      rulesVersion: "INTEGER DEFAULT 1",
    })) {
      if (!columns.some((c) => c.name === name))
        await db.exec(`ALTER TABLE records ADD COLUMN ${name} ${definition}`);
    }
    await db.run(
      `UPDATE records SET baselineWeight = ?, baselineCO2 = ?, baselineWater = ?, targetRatio = ? WHERE baselineWeight IS NULL`,
      [baseline.weight, baseline.co2, baseline.water, baseline.targetRatio],
    );
    await db.exec(`UPDATE records SET schoolId = (SELECT schoolId FROM users WHERE users.cardID = records.cardID) WHERE schoolId IS NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_records_event ON records(eventId) WHERE eventId IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_school ON users(schoolId);`);
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await db.close();
  }
}
export async function withDB<T>(
  work: (db: Database) => Promise<T>,
): Promise<T> {
  if (!initialized)
    initialized = initialize().catch((error) => {
      initialized = undefined;
      throw error;
    });
  await initialized;
  const db = await connect();
  try {
    return await work(db);
  } finally {
    await db.close();
  }
}
