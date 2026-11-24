import type * as SQLite from 'expo-sqlite';
import { migration001 } from './migration_001';
import { migration002 } from './migration_002';

export type Migration = {
  version: number;
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

export const migrations: Migration[] = [migration001, migration002];
