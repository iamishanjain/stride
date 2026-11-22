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
