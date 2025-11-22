import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { randomUUID } from 'crypto';

interface UserData {
  uid: string;
  displayName: string;
  cardID: string;
}

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
      totalCO2 REAL DEFAULT 0
    );
  `);
}

// GET /api/users
export async function GET() {
  try {
    const db = await openDB();
    await ensureUsersTable(db);

    const users: Pick<UserData, 'uid' | 'displayName'>[] = await db.all(
      'SELECT uid, displayName FROM users ORDER BY displayName ASC'
    );

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users', details: error }, { status: 500 });
  }
}

// POST /api/users
export async function POST(req: NextRequest) {
  try {
    const { cardID, displayName } = await req.json();

    if (!cardID || !displayName) {
      return NextResponse.json({ error: 'Missing cardID or displayName' }, { status: 400 });
    }

    const db = await openDB();
    await ensureUsersTable(db);

    const uid = randomUUID();

    await db.run(
      'INSERT INTO users (uid, cardID, displayName, totalCO2) VALUES (?, ?, ?, 0)',
      [uid, cardID, displayName]
    );

    return NextResponse.json({ message: 'User added successfully', uid, displayName });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'CardID already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add user', details: error }, { status: 500 });
  }
}
