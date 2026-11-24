import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';

let database: SQLite.SQLiteDatabase | null = null;
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  if (!databasePromise) {
    databasePromise = (async () => {
      const nextDatabase = await SQLite.openDatabaseAsync('stride.db');
      await nextDatabase.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
      await runMigrations(nextDatabase);
      database = nextDatabase;
      return nextDatabase;
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) continue;
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
  }
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
  }
  database = null;
  databasePromise = null;
}
