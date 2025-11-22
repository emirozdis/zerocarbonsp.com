/*
  File: route.ts
  Changelog:
    - Validates cardUID exists in users table
    - Rejects negative weights (0 allowed)
    - Calculates CO2 based on hardcoded factors
    - Updates users.totalCO2
    - Returns aggregated and detailed records
    - Type-safe and production-ready
*/

import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

type WasteType = 0 | 1 | 2;

interface WasteRecord {
  id: number;
  uid: string;
  weight: number;
  co2Emission: number;
  createdAt: string;
  wasteType: WasteType;
}

interface UserData {
  uid: string;
  displayName: string;
  totalCO2: number;
}

const CO2_FACTORS: Record<WasteType, number> = {
  0: 1,
  1: 5.5,
  2: 16.5,
};

async function openDB(): Promise<Database> {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
}

async function ensureTables(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      cardID TEXT UNIQUE NOT NULL,
      displayName TEXT NOT NULL,
      totalCO2 REAL DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardID TEXT NOT NULL,
      weight REAL NOT NULL,
      co2Emission REAL NOT NULL,
      createdAt TEXT NOT NULL,
      wasteType INTEGER NOT NULL,
      FOREIGN KEY (cardID) REFERENCES users(cardID)
    );
  `);
}

function calculateCO2(weight: number, type: WasteType) {
  return weight * CO2_FACTORS[type];
}

export async function POST(req: NextRequest) {
  try {
    const { cardUID, type, weight } = await req.json();

    if (!cardUID || type === undefined || weight === undefined) {
      return NextResponse.json({ error: 'Missing fields: cardUID, type, or weight' }, { status: 400 });
    }

    if (typeof weight !== 'number' || weight < 0) {
      return NextResponse.json({ error: 'Weight must be a number >= 0' }, { status: 400 });
    }

    if (![0,1,2].includes(type)) {
      return NextResponse.json({ error: 'Invalid waste type. Must be 0, 1, or 2' }, { status: 400 });
    }

    const db = await openDB();
    await ensureTables(db);

    const user: { uid: string } | undefined = await db.get(
      'SELECT uid FROM users WHERE cardID = ?',
      [cardUID]
    );

    if (!user) {
      return NextResponse.json({ error: 'CardUID not registered' }, { status: 400 });
    }

    const co2Emission = calculateCO2(weight, type as WasteType);
    const createdAt = new Date().toISOString();

    await db.run(
      'INSERT INTO records (cardID, weight, co2Emission, createdAt, wasteType) VALUES (?, ?, ?, ?, ?)',
      [cardUID, weight, co2Emission, createdAt, type]
    );

    await db.run(
      'UPDATE users SET totalCO2 = totalCO2 + ? WHERE cardID = ?',
      [co2Emission, cardUID]
    );

    return NextResponse.json({ message: 'Record saved', co2Emission });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save record', details: error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get('uid');

    const db = await openDB();
    await ensureTables(db);

    if (uid) {
      const user: UserData | undefined = await db.get(
        'SELECT uid, displayName, totalCO2 FROM users WHERE uid = ?',
        [uid]
      );
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const records: WasteRecord[] = await db.all(
        'SELECT r.id, u.uid, r.weight, r.co2Emission, r.createdAt, r.wasteType FROM records r INNER JOIN users u ON r.cardID = u.cardID WHERE u.uid = ? ORDER BY r.createdAt DESC',
        [uid]
      );

      const rows: { wasteType: WasteType; totalWeight: number; totalCO2: number }[] = await db.all(
        'SELECT r.wasteType, SUM(r.weight) as totalWeight, SUM(r.co2Emission) as totalCO2 FROM records r INNER JOIN users u ON r.cardID = u.cardID WHERE u.uid = ? GROUP BY r.wasteType',
        [uid]
      );

      const aggregated: Record<WasteType, { weight: number; co2: number }> = {
        0: { weight: 0, co2: 0 },
        1: { weight: 0, co2: 0 },
        2: { weight: 0, co2: 0 },
      };

      rows.forEach(row => {
        aggregated[row.wasteType] = { weight: row.totalWeight, co2: row.totalCO2 };
      });

      return NextResponse.json({ user, aggregated, records });
    } else {
      const users: UserData[] = await db.all(
        'SELECT uid, displayName, totalCO2 FROM users ORDER BY totalCO2 DESC'
      );
      return NextResponse.json(users);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch records', details: error }, { status: 500 });
  }
}
