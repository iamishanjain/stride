import { getDatabase } from '../database';
import { ActivityStatus, ActivityVisibility, DatabaseActivity, SportType } from '../types/database.types';
import { Activity, GPSPoint, TrackingStatus } from '../../features/tracking/types/tracking.types';

type ActivityRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  sport_type: SportType;
  started_at: number;
  ended_at: number | null;
  distance_meters: number;
  elapsed_seconds: number;
  moving_seconds: number;
  avg_pace_seconds_per_km: number | null;
  best_pace_seconds_per_km: number | null;
  avg_speed_mps: number | null;
  max_speed_mps: number | null;
  elevation_gain_meters: number;
  elevation_loss_meters: number;
  status: ActivityStatus;
  visibility: ActivityVisibility;
  notes: string | null;
  timezone_offset_minutes: number | null;
  local_date: string | null;
  created_at: number;
  updated_at: number;
};

function mapActivity(row: ActivityRow): DatabaseActivity {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    sportType: row.sport_type,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    distanceMeters: row.distance_meters,
    elapsedSeconds: row.elapsed_seconds,
    movingSeconds: row.moving_seconds,
    avgPaceSecondsPerKm: row.avg_pace_seconds_per_km,
    bestPaceSecondsPerKm: row.best_pace_seconds_per_km,
    avgSpeedMps: row.avg_speed_mps,
    maxSpeedMps: row.max_speed_mps,
    elevationGainMeters: row.elevation_gain_meters,
    elevationLossMeters: row.elevation_loss_meters,
    status: row.status,
    visibility: row.visibility,
    notes: row.notes,
    timezoneOffsetMinutes: row.timezone_offset_minutes,
    localDate: row.local_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createActivity(input: {
  id: string;
  startedAt: number;
  distanceMeters?: number;
  elapsedSeconds?: number;
  userId?: string | null;
  title?: string | null;
  sportType?: SportType;
  timezoneOffsetMinutes?: number | null;
  localDate?: string | null;
}): Promise<DatabaseActivity> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM activities WHERE id = ?', input.id);
  if (existing) throw new Error('Activity already exists.');
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO activities (
      id, user_id, title, sport_type, started_at, distance_meters, elapsed_seconds,
      moving_seconds, elevation_gain_meters, elevation_loss_meters, status, visibility,
      timezone_offset_minutes, local_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'recording', 'private', ?, ?, ?, ?)`,
    input.id,
    input.userId ?? null,
    input.title ?? null,
    input.sportType ?? 'running',
    input.startedAt,
    input.distanceMeters ?? 0,
    input.elapsedSeconds ?? 0,
    input.timezoneOffsetMinutes ?? null,
    input.localDate ?? null,
    now,
    now,
  );
  const row = await db.getFirstAsync<ActivityRow>('SELECT * FROM activities WHERE id = ?', input.id);
  if (!row) throw new Error('Activity could not be created.');
  return mapActivity(row);
}

export async function getActivityById(id: string): Promise<DatabaseActivity | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ActivityRow>('SELECT * FROM activities WHERE id = ?', id);
  return row ? mapActivity(row) : null;
}

export async function completeActivity(id: string, summary: {
  endedAt: number;
  distanceMeters: number;
  elapsedSeconds: number;
  movingSeconds?: number;
  elevationGainMeters?: number;
  elevationLossMeters?: number;
  avgPaceSecondsPerKm?: number | null;
  bestPaceSecondsPerKm?: number | null;
  avgSpeedMps?: number | null;
  maxSpeedMps?: number | null;
}): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const activity = await db.getFirstAsync<{ status: string }>('SELECT status FROM activities WHERE id = ?', id);
    if (!activity) throw new Error('Activity not found.');
    if (activity.status !== 'recording' && activity.status !== 'paused') throw new Error('Only recording or paused activities can be completed.');
    await db.runAsync(
      `UPDATE activities SET
        ended_at = ?, distance_meters = ?, elapsed_seconds = ?, moving_seconds = ?,
        elevation_gain_meters = ?, elevation_loss_meters = ?, avg_pace_seconds_per_km = ?,
        best_pace_seconds_per_km = ?, avg_speed_mps = ?, max_speed_mps = ?,
        status = 'completed', updated_at = ?
       WHERE id = ?`,
      summary.endedAt,
      summary.distanceMeters,
      summary.elapsedSeconds,
      summary.movingSeconds ?? summary.elapsedSeconds,
      summary.elevationGainMeters ?? 0,
      summary.elevationLossMeters ?? 0,
      summary.avgPaceSecondsPerKm ?? null,
      summary.bestPaceSecondsPerKm ?? null,
      summary.avgSpeedMps ?? null,
      summary.maxSpeedMps ?? null,
      Date.now(),
      id,
    );
  });
}

export async function updateActivity(id: string, updates: Partial<Pick<DatabaseActivity, 'title' | 'sportType' | 'visibility' | 'notes'>>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE activities SET title = COALESCE(?, title), sport_type = COALESCE(?, sport_type),
     visibility = COALESCE(?, visibility), notes = COALESCE(?, notes), updated_at = ?
     WHERE id = ?`,
    updates.title ?? null,
    updates.sportType ?? null,
    updates.visibility ?? null,
    updates.notes ?? null,
    Date.now(),
    id,
  );
}

export async function discardActivity(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE activities SET status = 'discarded', updated_at = ? WHERE id = ?", Date.now(), id);
}

export async function deleteActivity(id: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM activities WHERE id = ?', id);
  });
}

export async function assignActivityToUser(id: string, userId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE activities SET user_id = ?, updated_at = ? WHERE id = ?', userId, Date.now(), id);
}

export async function getRecoverableActivities(): Promise<DatabaseActivity[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActivityRow>(
    "SELECT * FROM activities WHERE status IN ('recording','paused') ORDER BY started_at DESC",
  );
  return rows.map(mapActivity);
}

export async function getActivityHistoryPaginated(limit = 20, offset = 0, userId?: string): Promise<Activity[]> {
  const db = await getDatabase();
  const rows = userId
    ? await db.getAllAsync<ActivityRow>(
        "SELECT * FROM activities WHERE status = 'completed' AND (user_id = ? OR user_id IS NULL) ORDER BY started_at DESC, id DESC LIMIT ? OFFSET ?",
        userId, limit, offset,
      )
    : await db.getAllAsync<ActivityRow>(
        "SELECT * FROM activities WHERE status = 'completed' ORDER BY started_at DESC, id DESC LIMIT ? OFFSET ?",
        limit, offset,
      );
  return Promise.all(rows.map(async (row) => {
    const points = await db.getAllAsync<{ latitude: number; longitude: number; timestamp: number; altitude: number | null; accuracy: number | null; speed: number | null; heading: number | null }>(
      'SELECT latitude, longitude, timestamp, altitude, accuracy, speed, heading FROM gps_points WHERE activity_id = ? ORDER BY sequence_number ASC LIMIT 20',
      row.id,
    );
    return {
      id: row.id,
      startedAt: row.started_at,
      endedAt: row.ended_at ?? undefined,
      distanceMeters: row.distance_meters,
      elapsedSeconds: row.elapsed_seconds,
      status: row.status === 'completed' ? 'finished' : row.status as TrackingStatus,
      points: points.map<GPSPoint>((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
        timestamp: point.timestamp,
        altitude: point.altitude,
        accuracy: point.accuracy,
        speed: point.speed,
        heading: point.heading,
      })),
    };
  }));
}

export async function getActivitiesByDateRange(startMs: number, endMs: number, userId?: string): Promise<DatabaseActivity[]> {
  const db = await getDatabase();
  const rows = userId
    ? await db.getAllAsync<ActivityRow>(
        "SELECT * FROM activities WHERE status = 'completed' AND started_at >= ? AND started_at < ? AND (user_id = ? OR user_id IS NULL) ORDER BY started_at DESC, id DESC",
        startMs, endMs, userId,
      )
    : await db.getAllAsync<ActivityRow>(
        "SELECT * FROM activities WHERE status = 'completed' AND started_at >= ? AND started_at < ? ORDER BY started_at DESC, id DESC",
        startMs, endMs,
      );
  return rows.map(mapActivity);
}

export async function getActivityHistoryGroupedByDate(limit = 20, offset = 0, userId?: string): Promise<Record<string, DatabaseActivity[]>> {
  const db = await getDatabase();
  const rows = userId
    ? await db.getAllAsync<ActivityRow>(
        "SELECT * FROM activities WHERE status = 'completed' AND (user_id = ? OR user_id IS NULL) ORDER BY started_at DESC, id DESC LIMIT ? OFFSET ?",
        userId, limit, offset,
      )
    : await db.getAllAsync<ActivityRow>(
        "SELECT * FROM activities WHERE status = 'completed' ORDER BY started_at DESC, id DESC LIMIT ? OFFSET ?",
        limit, offset,
      );
  const groups: Record<string, DatabaseActivity[]> = {};
  for (const row of rows) {
    const activity = mapActivity(row);
    const date = activity.localDate ?? new Date(activity.startedAt).toISOString().slice(0, 10);
    (groups[date] ??= []).push(activity);
  }
  return groups;
}

export async function saveActivity(activity: Activity, endedAt = Date.now()): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO activities (
        id, title, sport_type, started_at, ended_at, distance_meters, elapsed_seconds,
        moving_seconds, elevation_gain_meters, elevation_loss_meters, status, visibility,
        timezone_offset_minutes, local_date, created_at, updated_at
      ) VALUES (?, 'Morning Run', 'running', ?, ?, ?, ?, ?, 0, 0, 'completed', 'private', NULL, NULL, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        ended_at = excluded.ended_at,
        distance_meters = excluded.distance_meters,
        elapsed_seconds = excluded.elapsed_seconds,
        moving_seconds = excluded.moving_seconds,
        elevation_gain_meters = excluded.elevation_gain_meters,
        elevation_loss_meters = excluded.elevation_loss_meters,
        status = 'completed',
        updated_at = excluded.updated_at`,
      activity.id,
      activity.startedAt,
      endedAt,
      activity.distanceMeters,
      activity.elapsedSeconds,
      activity.elapsedSeconds,
      activity.startedAt,
      now,
    );
  });
}

export async function saveActivityMetadata(activity: Pick<Activity, 'id' | 'startedAt' | 'distanceMeters' | 'elapsedSeconds' | 'status'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO activities (
      id, title, sport_type, started_at, distance_meters, elapsed_seconds,
      moving_seconds, elevation_gain_meters, elevation_loss_meters, status, visibility,
      timezone_offset_minutes, local_date, created_at, updated_at
    ) VALUES (?, NULL, 'running', ?, ?, ?, 0, 0, 0, 'recording', 'private', NULL, NULL, ?, ?)`,
    activity.id,
    activity.startedAt,
    activity.distanceMeters,
    activity.elapsedSeconds,
    activity.startedAt,
    Date.now(),
  );
  await db.runAsync(
    `UPDATE activities SET distance_meters = ?, elapsed_seconds = ?, updated_at = ? WHERE id = ?`,
    activity.distanceMeters,
    activity.elapsedSeconds,
    Date.now(),
    activity.id,
  );
}

export async function getRecentActivities(limit = 20): Promise<Activity[]> {
  return getActivityHistoryPaginated(limit, 0);
}

export async function appendGPSPoint(activityId: string, point: GPSPoint): Promise<void> {
  const { insertPoint } = await import('./GPSPointRepository');
  await insertPoint(activityId, point);
}
