// src/app/api/records/route.ts

import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// ===== TYPES =====
type WasteType = 0 | 1 | 2;

interface WasteRecord {
  id: number;
  cardID: string;
  weight: number;
  co2Emission: number;
  waterFootprint: number;
  createdAt: string;
  wasteType: WasteType;
}

interface UserData {
  uid: string;
  displayName: string;
  totalCO2: number;
  totalWater: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== CONFIGURATION =====
const CO2_FACTORS: Record<WasteType, number> = {
  0: 1,
  1: 5.5,
  2: 16.5,
};

// Water footprint factors (liters per gram of waste)
// Type 0 (Vegetables & Fruits): ~0.322 L/g (average water footprint for produce)
// Type 1 (Milk & Milk Products): ~1.020 L/g (average water footprint for dairy)
// Type 2 (Meat Products): ~15.415 L/g (average water footprint for meat)
const WATER_FACTORS: Record<WasteType, number> = {
  0: 0.322,
  1: 1.020,
  2: 15.415,
};

const VALID_API_KEYS = process.env.API_KEYS?.split(',') || ['ESP01_SECRET_KEY'];
const API_KEY_HEADER = 'x-api-key';

// ===== DATABASE FUNCTIONS =====
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
      totalCO2 REAL DEFAULT 0,
      totalWater REAL DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cardID TEXT NOT NULL,
      weight REAL NOT NULL,
      co2Emission REAL NOT NULL,
      waterFootprint REAL NOT NULL,
      createdAt TEXT NOT NULL,
      wasteType INTEGER NOT NULL CHECK(wasteType IN (0, 1, 2)),
      FOREIGN KEY (cardID) REFERENCES users(cardID)
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_records_cardID ON records(cardID);
    CREATE INDEX IF NOT EXISTS idx_records_createdAt ON records(createdAt);
  `);
}

// ===== VALIDATION FUNCTIONS =====
function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get(API_KEY_HEADER);
  return apiKey !== null && VALID_API_KEYS.includes(apiKey);
}

function validateWasteType(type: any): type is WasteType {
  return [0, 1, 2].includes(type);
}

function validateWeight(weight: any): boolean {
  return typeof weight === 'number' && weight >= 0 && isFinite(weight);
}

// ===== RESPONSE HELPERS =====
function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Yetkisiz erisim: Gecersiz veya eksik API anahtari'
    },
    { status: 401 }
  );
}

function calculateCO2(weight: number, type: WasteType): number {
  return weight * CO2_FACTORS[type];
}

function calculateWaterFootprint(weight: number, type: WasteType): number {
  return weight * WATER_FACTORS[type];
}

// ===== POST /api/records - Save waste record (API KEY REQUIRED) =====
export async function POST(req: NextRequest) {
  try {
    // API Key Validation - REQUIRED for writes
    if (!validateApiKey(req)) {
      return createUnauthorizedResponse();
    }

    const body = await req.json();
    const { cardUID, type, weight } = body;

    // Field validation
    if (!cardUID || type === undefined || weight === undefined) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Eksik alanlar: cardUID, type veya weight' 
        },
        { status: 400 }
      );
    }

    // Weight validation
    if (!validateWeight(weight)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Agirlik bir sayi olmali ve >= 0 olmali' 
        },
        { status: 400 }
      );
    }

    // Waste type validation
    if (!validateWasteType(type)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Gecersiz atik turu. 0, 1 veya 2 olmali' 
        },
        { status: 400 }
      );
    }

    const db = await openDB();
    await ensureTables(db);

    // Check if user exists
    const user = await db.get(
      'SELECT uid FROM users WHERE cardID = ?',
      [cardUID]
    );

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Kartid kayitli degil' 
        },
        { status: 404 }
      );
    }

    // Calculate CO2 and water footprint
    const co2Emission = calculateCO2(weight, type as WasteType);
    const waterFootprint = calculateWaterFootprint(weight, type as WasteType);
    const createdAt = new Date().toISOString();

    // Insert record
    const result = await db.run(
      'INSERT INTO records (cardID, weight, co2Emission, waterFootprint, createdAt, wasteType) VALUES (?, ?, ?, ?, ?, ?)',
      [cardUID, weight, co2Emission, waterFootprint, createdAt, type]
    );

    // Update user total CO2 and water
    await db.run(
      'UPDATE users SET totalCO2 = totalCO2 + ?, totalWater = totalWater + ? WHERE cardID = ?',
      [co2Emission, waterFootprint, cardUID]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Kayit basarili kaydedildi',
        data: {
          recordId: result.lastID,
          co2Emission: parseFloat(co2Emission.toFixed(2)),
          waterFootprint: parseFloat(waterFootprint.toFixed(2)),
          weight,
          wasteType: type
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/records error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Kayit kaydetme basarisiz' 
      },
      { status: 500 }
    );
  }
}

// ===== GET /api/records - Fetch records (NO API KEY REQUIRED) =====
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    const db = await openDB();
    await ensureTables(db);

    if (uid) {
      // Fetch specific user and their records
      const user: UserData | undefined = await db.get(
        'SELECT uid, displayName, totalCO2, totalWater FROM users WHERE uid = ?',
        [uid]
      );

      if (!user) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Kullanici bulunamadi' 
          },
          { status: 404 }
        );
      }

      // Get all records for user
      const records: WasteRecord[] = await db.all(
        `SELECT r.id, r.cardID, r.weight, r.co2Emission, r.waterFootprint, r.createdAt, r.wasteType 
         FROM records r 
         INNER JOIN users u ON r.cardID = u.cardID 
         WHERE u.uid = ? 
         ORDER BY r.createdAt DESC`,
        [uid]
      );

      // Get aggregated stats by waste type
      const aggregated = await db.all(
        `SELECT r.wasteType, SUM(r.weight) as totalWeight, SUM(r.co2Emission) as totalCO2, SUM(r.waterFootprint) as totalWater
         FROM records r 
         INNER JOIN users u ON r.cardID = u.cardID 
         WHERE u.uid = ? 
         GROUP BY r.wasteType`,
        [uid]
      );

      const aggregatedData: Record<WasteType, { weight: number; co2: number; water: number }> = {
        0: { weight: 0, co2: 0, water: 0 },
        1: { weight: 0, co2: 0, water: 0 },
        2: { weight: 0, co2: 0, water: 0 },
      };

      aggregated.forEach((row: any) => {
        aggregatedData[row.wasteType as WasteType] = {
          weight: parseFloat(row.totalWeight.toFixed(2)),
          co2: parseFloat(row.totalCO2.toFixed(2)),
          water: parseFloat(row.totalWater.toFixed(2))
        };
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            user,
            aggregated: aggregatedData,
            records,
            recordCount: records.length
          }
        },
        { status: 200 }
      );
    } else {
      // Fetch all users - PUBLIC LEADERBOARD
      const users: UserData[] = await db.all(
        'SELECT uid, displayName, totalCO2, totalWater FROM users ORDER BY totalCO2 ASC'
      );

      return NextResponse.json(
        {
          success: true,
          data: users,
          count: users.length
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('GET /api/records error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Kayitlar yukleme basarisiz' 
      },
      { status: 500 }
    );
  }
}