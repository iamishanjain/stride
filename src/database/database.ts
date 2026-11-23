import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    database = await SQLite.openDatabaseAsync('stride.db');
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        distance_meters REAL NOT NULL,
        elapsed_seconds REAL NOT NULL,
        status TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS gps_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        altitude REAL,
        accuracy REAL,
        speed REAL,
        heading REAL,
        FOREIGN KEY(activity_id) REFERENCES activities(id)
      );
      CREATE INDEX IF NOT EXISTS gps_points_activity_timestamp
        ON gps_points(activity_id, timestamp);
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT,
        photo TEXT
      );
    `);
  }
  return database;
}
