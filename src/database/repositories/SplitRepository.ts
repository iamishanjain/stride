import { getDatabase } from '../database';

export type ActivitySplit = {
  id: string;
  activityId: string;
  splitNumber: number;
  distanceMeters: number;
  elapsedSeconds: number;
  movingSeconds: number;
  avgPaceSecondsPerKm: number | null;
  avgSpeedMps: number | null;
  elevationGainMeters: number;
  startedAt: number;
  endedAt: number;
};

export async function insertSplitsBatch(activityId: string, splits: ActivitySplit[]): Promise<void> {
  if (!splits.length) return;
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const split of splits) {
      await db.runAsync(
        `INSERT INTO activity_splits (
          id, activity_id, split_number, distance_meters, elapsed_seconds, moving_seconds,
          avg_pace_seconds_per_km, avg_speed_mps, elevation_gain_meters, started_at, ended_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(activity_id, split_number) DO UPDATE SET
          distance_meters = excluded.distance_meters,
          elapsed_seconds = excluded.elapsed_seconds,
          moving_seconds = excluded.moving_seconds,
          avg_pace_seconds_per_km = excluded.avg_pace_seconds_per_km,
          avg_speed_mps = excluded.avg_speed_mps,
          elevation_gain_meters = excluded.elevation_gain_meters,
          started_at = excluded.started_at,
          ended_at = excluded.ended_at`,
        split.id,
        activityId,
        split.splitNumber,
        split.distanceMeters,
        split.elapsedSeconds,
        split.movingSeconds,
        split.avgPaceSecondsPerKm,
        split.avgSpeedMps,
        split.elevationGainMeters,
        split.startedAt,
        split.endedAt,
        Date.now(),
      );
    }
  });
}

export async function getSplitsByActivityId(activityId: string): Promise<ActivitySplit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string; activity_id: string; split_number: number; distance_meters: number;
    elapsed_seconds: number; moving_seconds: number; avg_pace_seconds_per_km: number | null;
    avg_speed_mps: number | null; elevation_gain_meters: number; started_at: number; ended_at: number;
  }>(
    'SELECT * FROM activity_splits WHERE activity_id = ? ORDER BY split_number ASC',
    activityId,
  );
  return rows.map((row) => ({
    id: row.id,
    activityId: row.activity_id,
    splitNumber: row.split_number,
    distanceMeters: row.distance_meters,
    elapsedSeconds: row.elapsed_seconds,
    movingSeconds: row.moving_seconds,
    avgPaceSecondsPerKm: row.avg_pace_seconds_per_km,
    avgSpeedMps: row.avg_speed_mps,
    elevationGainMeters: row.elevation_gain_meters,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  }));
}

export async function deleteSplitsByActivityId(activityId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM activity_splits WHERE activity_id = ?', activityId);
}
