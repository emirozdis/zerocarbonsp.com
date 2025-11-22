// src/app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { randomUUID } from 'crypto';

// ===== TYPES =====
interface UserData {
  uid: string;
  displayName: string;
  cardID: string;
}

// ===== CONFIGURATION =====
const VALID_API_KEYS = process.env.API_KEYS?.split(',') || ['ESP01_SECRET_KEY'];
const API_KEY_HEADER = 'x-api-key';

// ===== DATABASE FUNCTIONS =====
async function openDB(): Promise<Database> {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
}

async function ensureUsersTable(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      cardID TEXT UNIQUE NOT NULL,
      displayName TEXT NOT NULL,
      totalCO2 REAL DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ===== VALIDATION FUNCTIONS =====
function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get(API_KEY_HEADER);
  return apiKey !== null && VALID_API_KEYS.includes(apiKey);
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

// ===== GET /api/users - Fetch user by cardID or all users (NO API KEY REQUIRED) =====
export async function GET(req: NextRequest) {
  try {
    const db = await openDB();
    await ensureUsersTable(db);

    const cardID = req.nextUrl.searchParams.get('cardID');

    if (cardID) {
      // Fetch specific user by cardID
      const user: Pick<UserData, 'uid' | 'displayName'> | undefined = await db.get(
        'SELECT uid, displayName FROM users WHERE cardID = ?',
        [cardID]
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

      return NextResponse.json(
        {
          success: true,
          data: user
        },
        { status: 200 }
      );
    }

    // Fetch all users - PUBLIC LIST
    const users: Pick<UserData, 'uid' | 'displayName'>[] = await db.all(
      'SELECT uid, displayName FROM users ORDER BY displayName ASC'
    );

    return NextResponse.json(
      {
        success: true,
        data: users,
        count: users.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanicilar yukleme basarisiz'
      },
      { status: 500 }
    );
  }
}

// ===== POST /api/users - Create new user (API KEY REQUIRED) =====
export async function POST(req: NextRequest) {
  try {
    // API Key Validation - REQUIRED for writes
    if (!validateApiKey(req)) {
      return createUnauthorizedResponse();
    }

    const { cardID, displayName } = await req.json();

    // Field validation
    if (!cardID || !displayName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Eksik alanlar: cardID veya displayName'
        },
        { status: 400 }
      );
    }

    // Type validation
    if (typeof cardID !== 'string' || typeof displayName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'cardID ve displayName metin olmali'
        },
        { status: 400 }
      );
    }

    // Length validation
    if (cardID.trim().length === 0 || displayName.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'cardID ve displayName bos olmamali'
        },
        { status: 400 }
      );
    }

    const db = await openDB();
    await ensureUsersTable(db);

    const uid = randomUUID();
    const trimmedCardID = cardID.trim();
    const trimmedDisplayName = displayName.trim();

    try {
      await db.run(
        'INSERT INTO users (uid, cardID, displayName, totalCO2) VALUES (?, ?, ?, 0)',
        [uid, trimmedCardID, trimmedDisplayName]
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Kullanici basarili kaydedildi',
          data: {
            uid,
            cardID: trimmedCardID,
            displayName: trimmedDisplayName
          }
        },
        { status: 201 }
      );
    } catch (error: any) {
      if (error?.message?.includes('UNIQUE constraint failed')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bu kartID zaten kayitli'
          },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanici ekleme basarisiz'
      },
      { status: 500 }
    );
  }
}

// ===== DELETE /api/users - Delete user (API KEY REQUIRED) =====
export async function DELETE(req: NextRequest) {
  try {
    // API Key Validation - REQUIRED for writes
    if (!validateApiKey(req)) {
      return createUnauthorizedResponse();
    }

    const uid = req.nextUrl.searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Eksik alan: uid'
        },
        { status: 400 }
      );
    }

    const db = await openDB();
    await ensureUsersTable(db);

    // Check if user exists
    const user = await db.get(
      'SELECT uid FROM users WHERE uid = ?',
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

    // Delete user and their records
    await db.run(
      'DELETE FROM records WHERE cardID = (SELECT cardID FROM users WHERE uid = ?)',
      [uid]
    );
    await db.run('DELETE FROM users WHERE uid = ?', [uid]);

    return NextResponse.json(
      {
        success: true,
        message: 'Kullanici basarili silindi'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanici silme basarisiz'
      },
      { status: 500 }
    );
  }
}