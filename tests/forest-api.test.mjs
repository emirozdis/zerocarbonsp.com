import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { registerHooks } from "node:module";
import { NextRequest } from "next/server.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/"))
      return nextResolve(
        pathToFileURL(resolve("src", specifier.slice(2) + ".ts")).href,
        context,
      );
    if (specifier === "next/server")
      return nextResolve("next/server.js", context);
    return nextResolve(specifier, context);
  },
});
const dir = await mkdtemp(join(tmpdir(), "forest-test-"));
process.env.DATABASE_PATH = join(dir, "test.sqlite");
process.env.API_KEYS = "test-device-key";
// Exercise migration of a populated legacy database, not only an empty installation.
const legacy = await open({
  filename: process.env.DATABASE_PATH,
  driver: sqlite3.Database,
});
await legacy.exec(`CREATE TABLE users(uid TEXT PRIMARY KEY,cardID TEXT UNIQUE NOT NULL,displayName TEXT NOT NULL,totalCO2 REAL DEFAULT 0,totalWater REAL DEFAULT 0,createdAt TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE records(id INTEGER PRIMARY KEY AUTOINCREMENT,cardID TEXT NOT NULL,weight REAL NOT NULL,co2Emission REAL NOT NULL,waterFootprint REAL NOT NULL,createdAt TEXT NOT NULL,wasteType INTEGER NOT NULL);
INSERT INTO users(uid,cardID,displayName) VALUES ('legacy','legacy-card','Legacy Student');
INSERT INTO records(cardID,weight,co2Emission,waterFootprint,createdAt,wasteType) VALUES ('legacy-card',0,0,0,'2026-01-01T12:00:00Z',0);`);
await legacy.close();
const users = await import("../src/app/api/users/route.ts");
const records = await import("../src/app/api/records/route.ts");
const session = await import("../src/app/api/session/route.ts");
const forest = await import("../src/app/api/forest/route.ts");
const request = (path, method = "GET", body, extra = {}) =>
  new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      ...extra,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const key = { "x-api-key": "test-device-key" };
after(async () => {
  await rm(dir, { recursive: true, force: true });
});
test("legacy migration, scoped forest, atomic scans, duplicates, and sessions work end-to-end", async () => {
  assert.equal((await forest.GET(request("/api/forest"))).status, 401);
  const login = await session.POST(
    request("/api/session", "POST", { cardID: "legacy-card" }),
  );
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const before = await (
    await forest.GET(request("/api/forest", "GET", undefined, { cookie }))
  ).json();
  assert.equal(before.me.meals, 1);
  assert.ok(before.me.growth > 0);
  assert.equal(before.school.id, "default");
  const registration = await users.POST(
    request(
      "/api/users",
      "POST",
      {
        cardID: "other-card",
        displayName: "Other Student",
        schoolId: "other",
        schoolName: "Other School",
      },
      key,
    ),
  );
  assert.equal(registration.status, 201);
  const other = (await registration.json()).data;
  const payload = {
    cardUID: "legacy-card",
    type: 0,
    weight: 0,
    eventId: "unique-scan",
  };
  const [first, retry] = await Promise.all([
    records.POST(request("/api/records", "POST", payload, key)),
    records.POST(request("/api/records", "POST", payload, key)),
  ]);
  assert.equal(first.status, 200);
  assert.equal(retry.status, 200);
  const firstBody = await first.json(),
    retryBody = await retry.json();
  assert.equal(firstBody.data.recordId, retryBody.data.recordId);
  assert.ok(firstBody.duplicate || retryBody.duplicate);
  assert.equal(
    (
      await records.POST(
        request("/api/records", "POST", { ...payload, weight: 10 }, key),
      )
    ).status,
    409,
  );
  const updated = await (
    await forest.GET(request("/api/forest", "GET", undefined, { cookie }))
  ).json();
  const schoolRanking = await (
    await records.GET(request("/api/records", "GET", undefined, { cookie }))
  ).json();
  assert.equal(schoolRanking.success, true);
  assert.equal(schoolRanking.data.length, 1);
  assert.equal(schoolRanking.data[0].uid, "legacy");
  assert.equal(schoolRanking.data[0].mealCount, 2);
  assert.equal(schoolRanking.data[0].totalWaste, 0);
  assert.equal(schoolRanking.data[0].totalMealWeight, before.baseline.weight * 2);
  const allRanking = await (
    await records.GET(request("/api/records", "GET", undefined, key))
  ).json();
  const noMeals = allRanking.data.find((u) => u.uid === other.uid);
  assert.equal(noMeals.mealCount, 0);
  assert.equal(noMeals.totalMealWeight, 0);
  assert.equal(updated.me.meals, 2);
  assert.equal(updated.plants.length, 1);
  assert.equal(updated.me.growth, before.me.growth);
  assert.ok(updated.me.health > before.me.health);
  assert.equal(JSON.stringify(updated).includes("legacy-card"), false);
  assert.equal(
    (
      await records.GET(
        request(`/api/records?uid=${other.uid}`, "GET", undefined, { cookie }),
      )
    ).status,
    403,
  );
  assert.equal(
    (await records.POST(request("/api/records", "POST", payload))).status,
    401,
  );
  assert.equal(
    (await records.POST(request("/api/records", "POST", null, key))).status,
    400,
  );
  assert.equal(
    (
      await records.POST(
        request("/api/records", "POST", { ...payload, weight: -1 }, key),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await session.DELETE(
        request("/api/session", "DELETE", undefined, { cookie }),
      )
    ).status,
    200,
  );
  assert.equal(
    (await forest.GET(request("/api/forest", "GET", undefined, { cookie })))
      .status,
    401,
  );
});
