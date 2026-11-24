import type { Migration } from './index';

export const migration002: Migration = {
  version: 2,
  name: 'expand-local-activity-schema',
  up: async (db) => {
    await db.execAsync(`
      ALTER TABLE activities ADD COLUMN user_id TEXT;
      ALTER TABLE activities ADD COLUMN title TEXT;
      ALTER TABLE activities ADD COLUMN sport_type TEXT NOT NULL DEFAULT 'running';
      ALTER TABLE activities ADD COLUMN moving_seconds REAL NOT NULL DEFAULT 0;
      ALTER TABLE activities ADD COLUMN avg_pace_seconds_per_km REAL;
      ALTER TABLE activities ADD COLUMN best_pace_seconds_per_km REAL;
      ALTER TABLE activities ADD COLUMN avg_speed_mps REAL;
      ALTER TABLE activities ADD COLUMN max_speed_mps REAL;
      ALTER TABLE activities ADD COLUMN elevation_gain_meters REAL NOT NULL DEFAULT 0;
      ALTER TABLE activities ADD COLUMN elevation_loss_meters REAL NOT NULL DEFAULT 0;
      ALTER TABLE activities ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';
      ALTER TABLE activities ADD COLUMN notes TEXT;
      ALTER TABLE activities ADD COLUMN timezone_offset_minutes INTEGER;
      ALTER TABLE activities ADD COLUMN local_date TEXT;
      ALTER TABLE activities ADD COLUMN created_at INTEGER;
      ALTER TABLE activities ADD COLUMN updated_at INTEGER;
      UPDATE activities SET
        moving_seconds = CASE WHEN status = 'finished' THEN elapsed_seconds ELSE 0 END,
        created_at = COALESCE(created_at, started_at),
        updated_at = COALESCE(updated_at, COALESCE(ended_at, started_at));
      UPDATE activities SET status = 'completed' WHERE status = 'finished';

      ALTER TABLE gps_points ADD COLUMN sequence_number INTEGER;
      ALTER TABLE gps_points ADD COLUMN segment_number INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE gps_points ADD COLUMN created_at INTEGER;
      UPDATE gps_points SET
        sequence_number = (
          SELECT COUNT(*)
          FROM gps_points earlier
          WHERE earlier.activity_id = gps_points.activity_id
            AND (earlier.timestamp < gps_points.timestamp
              OR (earlier.timestamp = gps_points.timestamp AND earlier.id <= gps_points.id))
        ),
        created_at = COALESCE(created_at, timestamp);

      ALTER TABLE user_profile ADD COLUMN username TEXT;
      ALTER TABLE user_profile ADD COLUMN bio TEXT;
      ALTER TABLE user_profile ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE user_profile ADD COLUMN created_at INTEGER;
      ALTER TABLE user_profile ADD COLUMN updated_at INTEGER;
      UPDATE user_profile SET
        created_at = COALESCE(created_at, strftime('%s','now') * 1000),
        updated_at = COALESCE(updated_at, strftime('%s','now') * 1000);
      CREATE UNIQUE INDEX IF NOT EXISTS user_profile_username_unique
        ON user_profile(username) WHERE username IS NOT NULL;

      CREATE TABLE IF NOT EXISTS activity_pause_intervals (
        id TEXT PRIMARY KEY NOT NULL,
        activity_id TEXT NOT NULL,
        paused_at INTEGER NOT NULL,
        resumed_at INTEGER,
        created_at INTEGER NOT NULL,
        CHECK (resumed_at IS NULL OR resumed_at >= paused_at),
        FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS one_open_pause_per_activity
        ON activity_pause_intervals(activity_id) WHERE resumed_at IS NULL;

      CREATE TABLE IF NOT EXISTS activity_splits (
        id TEXT PRIMARY KEY NOT NULL,
        activity_id TEXT NOT NULL,
        split_number INTEGER NOT NULL,
        distance_meters REAL NOT NULL,
        elapsed_seconds REAL NOT NULL,
        moving_seconds REAL NOT NULL,
        avg_pace_seconds_per_km REAL,
        avg_speed_mps REAL,
        elevation_gain_meters REAL DEFAULT 0,
        started_at INTEGER NOT NULL,
        ended_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        UNIQUE(activity_id, split_number)
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('create','update','delete')),
        payload TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        next_retry_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS activities_started_at ON activities(started_at DESC);
      CREATE INDEX IF NOT EXISTS activities_user_started_at ON activities(user_id, started_at DESC);
      CREATE INDEX IF NOT EXISTS activities_status ON activities(status);
      CREATE INDEX IF NOT EXISTS activities_local_date ON activities(local_date);
      CREATE INDEX IF NOT EXISTS gps_points_activity_timestamp ON gps_points(activity_id, timestamp);
      CREATE UNIQUE INDEX IF NOT EXISTS gps_points_activity_sequence_unique ON gps_points(activity_id, sequence_number);
      CREATE INDEX IF NOT EXISTS gps_points_activity_sequence ON gps_points(activity_id, sequence_number);
      CREATE INDEX IF NOT EXISTS gps_points_activity_segment ON gps_points(activity_id, segment_number, sequence_number);
      CREATE INDEX IF NOT EXISTS activity_splits_activity_order ON activity_splits(activity_id, split_number);
      CREATE INDEX IF NOT EXISTS sync_queue_status_retry ON sync_queue(status, next_retry_at);
      CREATE INDEX IF NOT EXISTS sync_queue_entity ON sync_queue(entity_type, entity_id);
      PRAGMA foreign_keys = ON;
    `);
  },
};
