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
test("showcase contains one school, ten distinct students, a month of varied meals, and safe repeat/reset behavior", async () => {
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
      assert.equal(users.length, 10);
      assert.equal(users[0].cardID, "TEST001");
      assert.equal(users[9].cardID, "TEST010");
      const rows = await db.all("SELECT * FROM records ORDER BY id");
      assert.equal(rows.length, 220);
      assert.equal(new Set(rows.map((r) => r.eventId)).size, 220);
      assert.equal(new Set(rows.map((r) => r.createdAt.slice(0, 10))).size, 22);
      assert.ok(
        rows.every(
          (r) =>
            r.createdAt.startsWith("2026-09-") &&
            ![0, 6].includes(new Date(r.createdAt).getUTCDay()),
        ),
      );
      assert.ok(rows.some((r) => r.weight === 0));
      assert.deepEqual(
        new Set(rows.map((r) => r.wasteType)),
        new Set([0, 1, 2]),
      );
      const { growPlant } = await import("../src/lib/forest/model.ts");
      const projections = users.map(
        (user) =>
          growPlant(
            user,
            rows.filter((r) => r.cardID === user.cardID),
          ).plant,
      );
      assert.ok(projections[0].health > 95);
      assert.ok(projections[3].health < 50);
      assert.ok(projections[2].health > projections[3].health);
      assert.ok(projections[7].height < projections[0].height);
      const firstId = rows[0].id;
      const preserved = seed(dir);
      assert.equal(preserved.status, 0, preserved.stderr);
      assert.equal(
        (await db.get("SELECT COUNT(*) AS count FROM records")).count,
        220,
      );
      assert.equal(
        (await db.get("SELECT id FROM records ORDER BY id LIMIT 1")).id,
        firstId,
      );
      const reset = seed(dir, true);
      assert.equal(reset.status, 0, reset.stderr);
      assert.equal(
        (await db.get("SELECT COUNT(*) AS count FROM records")).count,
        220,
      );
      await db.run(
        "INSERT INTO users(uid,cardID,displayName) VALUES ('external-user','external-card','External')",
      );
      const blocked = seed(dir, true);
      assert.notEqual(blocked.status, 0);
      assert.equal(
        (await db.get("SELECT COUNT(*) AS count FROM users")).count,
        11,
      );
      assert.match(await readFile(join(dir, "report.md"), "utf8"), /TEST010/);
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
