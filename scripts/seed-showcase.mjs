import { existsSync } from "node:fs";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Node 24 can run the same TypeScript domain modules used by the application.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate)))
        return nextResolve(candidate.href, context);
    }
    return nextResolve(specifier, context);
  },
});
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const target = resolve(process.env.DATABASE_PATH || "./showcase.sqlite");
if (!/^showcase(?:-[a-zA-Z0-9_-]+)?\.sqlite$/.test(basename(target))) {
  throw new Error(
    "Showcase seeding requires a dedicated showcase.sqlite (or showcase-*.sqlite) database.",
  );
}
const reset = process.argv.includes("--reset");
const marker = "living-forest-showcase-v1";
if (existsSync(target)) {
  const existing = await open({ filename: target, driver: sqlite3.Database });
  try {
    const table = await existing.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='showcase_metadata'",
    );
    const metadata = table
      ? await existing.get(
          "SELECT value FROM showcase_metadata WHERE key = ?",
          "owner",
        )
      : null;
    if (metadata?.value !== marker)
      throw new Error(
        "Existing database is not an owned showcase fixture; it has been preserved. Choose a new showcase database path.",
      );
    if (!reset) {
      console.log(
        "Showcase already exists and was preserved. Use npm run seed:showcase -- --reset to recreate this fixture.",
      );
      process.exitCode = 0;
    } else {
      const foreignUsers = await existing.get(
        "SELECT COUNT(*) AS count FROM users WHERE uid NOT LIKE 'showcase-student-%' OR schoolId != 'default'",
      );
      const foreignSchools = await existing.get(
        "SELECT COUNT(*) AS count FROM schools WHERE id != 'default'",
      );
      if (foreignUsers.count || foreignSchools.count)
        throw new Error(
          "Database contains non-showcase students or schools; reset refused.",
        );
    }
  } finally {
    await existing.close();
  }
  if (!reset) process.exit(0);
}
process.env.DATABASE_PATH = target;
const { withDB, baseline } = await import("../src/server/db.ts");
const { createShowcase } = await import("../src/lib/forest/showcase.ts");
const { growPlant } = await import("../src/lib/forest/model.ts");
const start = process.env.SHOWCASE_START_DATE || "2026-09-01";
const end = process.env.SHOWCASE_END_DATE || "2026-09-30";
const students = createShowcase(baseline, start, end);
const schoolName = process.env.SCHOOL_NAME || "Yeşil Vadi Deney Okulu";
await withDB(async (db) => {
  await db.exec("BEGIN IMMEDIATE");
  try {
    if (reset) {
      await db.exec(
        "DELETE FROM records; DELETE FROM sessions; DELETE FROM users; DELETE FROM login_attempts; DELETE FROM sqlite_sequence WHERE name = 'records';",
      );
    }
    await db.run("UPDATE schools SET name = ? WHERE id = ?", [
      schoolName,
      "default",
    ]);
    await db.exec(
      "CREATE TABLE IF NOT EXISTS showcase_metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL)",
    );
    for (const [key, value] of Object.entries({
      owner: marker,
      start,
      end,
      synthetic: "true",
      students: String(students.length),
    })) {
      await db.run(
        "INSERT OR REPLACE INTO showcase_metadata(key,value) VALUES (?,?)",
        [key, value],
      );
    }
    for (const student of students) {
      const co2 = student.records.reduce(
        (sum, record) => sum + record.co2Emission,
        0,
      );
      const water = student.records.reduce(
        (sum, record) => sum + record.waterFootprint,
        0,
      );
      await db.run(
        "INSERT INTO users(uid,cardID,displayName,totalCO2,totalWater,createdAt,schoolId,plotIndex) VALUES (?,?,?,?,?,?,?,?)",
        [
          student.uid,
          student.cardID,
          student.displayName,
          co2,
          water,
          student.createdAt,
          student.schoolId,
          student.plotIndex,
        ],
      );
      for (const record of student.records) {
        await db.run(
          "INSERT INTO records(id,cardID,weight,co2Emission,waterFootprint,createdAt,wasteType,eventId,baselineWeight,baselineCO2,baselineWater,targetRatio,schoolId,rulesVersion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)",
          [
            record.id,
            student.cardID,
            record.weight,
            record.co2Emission,
            record.waterFootprint,
            record.createdAt,
            record.wasteType,
            record.eventId,
            record.baselineWeight,
            record.baselineCO2,
            record.baselineWater,
            record.targetRatio,
            student.schoolId,
          ],
        );
      }
    }
    await db.exec("COMMIT");
  } catch (error) {
    await db.exec("ROLLBACK");
    throw error;
  }
  const integrity = await db.get("PRAGMA integrity_check");
  const foreignKeys = await db.all("PRAGMA foreign_key_check");
  const counts = await db.get(
    "SELECT (SELECT COUNT(*) FROM schools) AS schools, (SELECT COUNT(*) FROM users) AS students, (SELECT COUNT(*) FROM records) AS meals, (SELECT COUNT(DISTINCT eventId) FROM records) AS events",
  );
  const incorrectTotals = await db.get(
    "SELECT COUNT(*) AS count FROM users u WHERE ABS(totalCO2 - (SELECT COALESCE(SUM(co2Emission),0) FROM records r WHERE r.cardID = u.cardID)) > 0.000001 OR ABS(totalWater - (SELECT COALESCE(SUM(waterFootprint),0) FROM records r WHERE r.cardID = u.cardID)) > 0.000001",
  );
  if (
    integrity.integrity_check !== "ok" ||
    foreignKeys.length ||
    counts.schools !== 1 ||
    counts.students !== 10 ||
    counts.meals !==
      students.reduce((sum, student) => sum + student.records.length, 0) ||
    counts.events !== counts.meals ||
    incorrectTotals.count
  )
    throw new Error("Showcase validation failed.");
  await db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  console.log(
    `Verified: ${counts.schools} school, ${counts.students} students, ${counts.meals} meals, ${students[0].records.length} school days. SQLite integrity and cumulative totals are correct.`,
  );
});
const asOf = new Date(`${end}T23:59:59Z`).getTime() + 86400000;
const rows = students
  .map((student) => {
    const { plant } = growPlant(student, student.records, asOf);
    return `| ${student.cardID} | ${student.displayName} | ${student.story} | ${plant.stage} | ${Math.round(plant.health)}% | ${plant.height.toFixed(2)} m |`;
  })
  .join("\n");
const reportPath = resolve(
  process.env.SHOWCASE_REPORT_PATH || "docs/showcase-data.md",
);
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(
  reportPath,
  `# Experimental school showcase\n\nAll names, card numbers, meal records, and environmental outcomes below are fictional experimental data.\n\n- Database: \`${basename(target)}\` (ignored by Git).\n- School: **${schoolName}**; school ID: \`default\`.\n- Period: **${start} through ${end}**, weekdays only.\n- Usage: **${students[0].records.length} lunches per student**, **${students.reduce((sum, s) => sum + s.records.length, 0)} total scans**.\n- Baselines: ${baseline.weight} g food, ${baseline.co2} g CO₂, ${baseline.water} L embodied water; waste target ${baseline.targetRatio * 100}%.\n\nSign in through “Kartımla giriş” with any card below. Start with **TEST001** for a healthy tree, **TEST003** for recovery, or **TEST004** for a recent setback. The signed-out preview is a separate synthetic demo; sign in to see this database's 10 students.\n\n| Test card | Placeholder student | Scenario | Stage after the month | Vitality | Virtual height |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n\nRun \`npm run seed:showcase\` to create the fixture. Rerunning preserves the existing database. To explicitly reset this showcase, use \`npm run seed:showcase -- --reset\`; reset revokes showcase sessions. The script refuses to overwrite an unmarked database or reset a database containing students/schools outside the fixture. It uses the production schema, impact factors, and growth rules.\n\nThe private device API key lives in \`.env.local\`; it is not needed for card sign-in. Restart an already-running application after changing environment settings. Use Node 24 for the seeding command.\n`,
);
console.log(
  `Created ${basename(target)}. Student login: TEST001 through TEST010. Details: docs/showcase-data.md.`,
);
