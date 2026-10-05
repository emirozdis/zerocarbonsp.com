import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
const seed = (dir, reset = false) =>
  spawnSync(
    process.execPath,
    ["scripts/seed-showcase.mjs", ...(reset ? ["--reset"] : [])],
    {
      encoding: "utf8",
      timeout: 10000,
      env: {
        ...process.env,
        DATABASE_PATH: join(dir, "showcase.sqlite"),
        SHOWCASE_REPORT_PATH: join(dir, "report.md"),
        SCHOOL_NAME: "Experimental Test School",
        SHOWCASE_START_DATE: "2026-09-01",
        SHOWCASE_END_DATE: "2026-09-30",
      },
    },
  );
test("showcase matches the report's four student profiles and safe repeat/reset behavior", async () => {
  const dir = await mkdtemp(join(tmpdir(), "showcase-fixture-"));
  try {
    const result = seed(dir);
    assert.equal(result.status, 0, result.stderr);
    const db = await open({
      filename: join(dir, "showcase.sqlite"),
      driver: sqlite3.Database,
    });
    try {
      assert.equal(
        (await db.get("SELECT COUNT(*) AS count FROM schools")).count,
        1,
      );
      const users = await db.all("SELECT * FROM users ORDER BY plotIndex");
      assert.equal(users.length, 4);
      assert.equal(users[0].cardID, "TEST001");
      assert.equal(users[3].cardID, "TEST004");
      const rows = await db.all("SELECT * FROM records ORDER BY id");
      assert.equal(rows.length, 240);
      assert.equal(new Set(rows.map((r) => r.eventId)).size, 240);
      assert.equal(new Set(rows.map((r) => r.createdAt.slice(0, 10))).size, 20);
      assert.ok(
        rows.every(
          (r) =>
            r.createdAt.startsWith("2025-11-") &&
            ![0, 6].includes(new Date(r.createdAt).getUTCDay()),
        ),
      );
      assert.deepEqual(
        new Set(rows.map((r) => r.wasteType)),
        new Set([0, 1, 2]),
      );
      const { dailyMeals, growPlant } = await import("../src/lib/forest/model.ts");
      const { reportTotals } = await import("../src/lib/forest/report-dataset.ts");
      const projections = users.map(
        (user) =>
          growPlant(
            user,
            dailyMeals(rows.filter((r) => r.cardID === user.cardID)),
          ).plant,
      );
      for (const [index, user] of users.entries()) {
        const totals = await db.get(
          "SELECT SUM(weight) AS waste, SUM(co2Emission) AS co2, SUM(waterFootprint) AS water FROM records WHERE cardID = ?",
          user.cardID,
        );
        assert.ok(Math.abs(totals.waste - reportTotals[index].wasteGrams) < 1e-8);
        assert.ok(Math.abs(totals.co2 / 1000 - reportTotals[index].co2Kilograms) < 1e-8);
        assert.ok(Math.abs(totals.water - reportTotals[index].waterLiters) < 1e-8);
        assert.equal(projections[index].meals, 20);
      }
      const firstId = rows[0].id;
      const preserved = seed(dir);
      assert.equal(preserved.status, 0, preserved.stderr);
      assert.equal(
        (await db.get("SELECT COUNT(*) AS count FROM records")).count,
        240,
      );
      assert.equal(
        (await db.get("SELECT id FROM records ORDER BY id LIMIT 1")).id,
        firstId,
      );
      const reset = seed(dir, true);
      assert.equal(reset.status, 0, reset.stderr);
      assert.equal(
        (await db.get("SELECT COUNT(*) AS count FROM records")).count,
        240,
      );
      await db.run(
        "INSERT INTO users(uid,cardID,displayName) VALUES ('external-user','external-card','External')",
      );
      const blocked = seed(dir, true);
      assert.notEqual(blocked.status, 0);
      assert.equal(
        (await db.get("SELECT COUNT(*) AS count FROM users")).count,
        5,
      );
      assert.match(await readFile(join(dir, "report.md"), "utf8"), /TEST004/);
    } finally {
      await db.close();
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("seeder preserves an existing unmarked SQLite database", async () => {
  const dir = await mkdtemp(join(tmpdir(), "showcase-preserve-"));
  try {
    const db = await open({
      filename: join(dir, "showcase.sqlite"),
      driver: sqlite3.Database,
    });
    try {
      await db.exec(
        "CREATE TABLE important_data(value TEXT); INSERT INTO important_data VALUES ('preserve me')",
      );
      const result = seed(dir, true);
      assert.notEqual(result.status, 0);
      assert.equal(
        (await db.get("SELECT value FROM important_data")).value,
        "preserve me",
      );
    } finally {
      await db.close();
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
