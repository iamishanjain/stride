import { Activity } from '../../features/tracking/types/tracking.types';
import { getDatabase } from '../database';

export async function saveActivity(activity: Activity, endedAt = Date.now()): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO activities
      (id, started_at, ended_at, distance_meters, elapsed_seconds, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
    activity.id, activity.startedAt, endedAt, activity.distanceMeters, activity.elapsedSeconds, activity.status,
  );
  await db.runAsync('DELETE FROM gps_points WHERE activity_id = ?', activity.id);
  for (const point of activity.points) {
    await db.runAsync(
      `INSERT INTO gps_points
        (activity_id, latitude, longitude, timestamp, altitude, accuracy, speed, heading)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      activity.id, point.latitude, point.longitude, point.timestamp, point.altitude ?? null,
      point.accuracy ?? null, point.speed ?? null, point.heading ?? null,
    );
  }
}

export async function saveActivityMetadata(activity: Pick<Activity, 'id' | 'startedAt' | 'distanceMeters' | 'elapsedSeconds' | 'status'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO activities
      (id, started_at, distance_meters, elapsed_seconds, status)
      VALUES (?, ?, ?, ?, ?)`,
    activity.id, activity.startedAt, activity.distanceMeters, activity.elapsedSeconds, activity.status,
  );
}

export async function appendGPSPoint(activityId: string, point: Activity['points'][number]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO gps_points
      (activity_id, latitude, longitude, timestamp, altitude, accuracy, speed, heading)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    activityId, point.latitude, point.longitude, point.timestamp, point.altitude ?? null,
    point.accuracy ?? null, point.speed ?? null, point.heading ?? null,
  );
}

export async function getRecentActivities(limit = 20): Promise<Activity[]> {
  const db = await getDatabase();
  const activities = await db.getAllAsync<{
    id: string;
    started_at: number;
    ended_at: number | null;
    distance_meters: number;
    elapsed_seconds: number;
    status: string;
  }>(
    `SELECT id, started_at, ended_at, distance_meters, elapsed_seconds, status
     FROM activities
     WHERE status = 'finished'
     ORDER BY started_at DESC
     LIMIT ?`,
    limit,
  );

  return Promise.all(activities.map(async (activity) => {
    const rows = await db.getAllAsync<{
      latitude: number;
      longitude: number;
      timestamp: number;
      altitude: number | null;
      accuracy: number | null;
      speed: number | null;
      heading: number | null;
    }>(
      `SELECT latitude, longitude, timestamp, altitude, accuracy, speed, heading
       FROM gps_points
       WHERE activity_id = ?
       ORDER BY timestamp ASC`,
      activity.id,
    );
    return {
      id: activity.id,
      startedAt: activity.started_at,
      endedAt: activity.ended_at ?? undefined,
      distanceMeters: activity.distance_meters,
      elapsedSeconds: activity.elapsed_seconds,
      status: 'finished',
      points: rows.map((row) => ({
        latitude: row.latitude,
        longitude: row.longitude,
        timestamp: row.timestamp,
        altitude: row.altitude,
        accuracy: row.accuracy,
        speed: row.speed,
        heading: row.heading,
      })),
    };
  }));
}
