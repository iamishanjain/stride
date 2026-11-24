import { getDatabase } from '../database';
import { ActivityRoutePoint, GPSPointInsert } from '../types/database.types';
import { isValidCoordinate } from '../utils/databaseUtils';

function isValidPoint(point: GPSPointInsert): boolean {
  return isValidCoordinate(point.latitude, point.longitude)
    && Number.isFinite(point.timestamp);
}

export async function insertPoint(activityId: string, point: GPSPointInsert): Promise<number> {
  if (!isValidPoint(point)) throw new Error('Invalid GPS point coordinates.');
  const db = await getDatabase();
  const last = await db.getFirstAsync<{ sequence_number: number }>(
    'SELECT sequence_number FROM gps_points WHERE activity_id = ? ORDER BY sequence_number DESC LIMIT 1',
    activityId,
  );
  const sequenceNumber = (last?.sequence_number ?? 0) + 1;
  const segmentNumber = point.segmentNumber ?? 0;
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO gps_points
      (activity_id, sequence_number, segment_number, latitude, longitude, timestamp, altitude, accuracy, speed, heading, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    activityId, sequenceNumber, segmentNumber, point.latitude, point.longitude, point.timestamp,
    point.altitude ?? null, point.accuracy ?? null, point.speed ?? null, point.heading ?? null, now,
  );
  return result.lastInsertRowId;
}

export async function insertPointsBatch(activityId: string, points: GPSPointInsert[]): Promise<void> {
  if (!points.length) return;
  if (points.some((point) => !isValidPoint(point))) throw new Error('Invalid GPS point coordinates.');
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const last = await db.getFirstAsync<{ sequence_number: number }>(
      'SELECT sequence_number FROM gps_points WHERE activity_id = ? ORDER BY sequence_number DESC LIMIT 1',
      activityId,
    );
    let sequenceNumber = last?.sequence_number ?? 0;
    const now = Date.now();
    for (const point of points) {
      sequenceNumber += 1;
      await db.runAsync(
        `INSERT INTO gps_points
          (activity_id, sequence_number, segment_number, latitude, longitude, timestamp, altitude, accuracy, speed, heading, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        activityId, sequenceNumber, point.segmentNumber ?? 0, point.latitude, point.longitude, point.timestamp,
        point.altitude ?? null, point.accuracy ?? null, point.speed ?? null, point.heading ?? null, now,
      );
    }
  });
}

export async function getRouteByActivityId(activityId: string): Promise<ActivityRoutePoint[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    sequence_number: number;
    segment_number: number;
    latitude: number;
    longitude: number;
    timestamp: number;
    altitude: number | null;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
  }>(
    `SELECT id, sequence_number, segment_number, latitude, longitude, timestamp, altitude, accuracy, speed, heading
     FROM gps_points WHERE activity_id = ? ORDER BY sequence_number ASC`,
    activityId,
  );
  return rows
    .filter((row) => Number.isFinite(row.latitude) && row.latitude >= -90 && row.latitude <= 90
      && Number.isFinite(row.longitude) && row.longitude >= -180 && row.longitude <= 180)
    .map((row) => ({
      id: row.id,
      sequenceNumber: row.sequence_number,
      segmentNumber: row.segment_number,
      latitude: row.latitude,
      longitude: row.longitude,
      timestamp: row.timestamp,
      altitude: row.altitude,
      accuracy: row.accuracy,
      speed: row.speed,
      heading: row.heading,
    }));
}

export async function getRoutePointsPaginated(activityId: string, limit = 500, offset = 0): Promise<ActivityRoutePoint[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number; sequence_number: number; segment_number: number; latitude: number; longitude: number;
    timestamp: number; altitude: number | null; accuracy: number | null; speed: number | null; heading: number | null;
  }>(
    `SELECT id, sequence_number, segment_number, latitude, longitude, timestamp, altitude, accuracy, speed, heading
     FROM gps_points WHERE activity_id = ? ORDER BY sequence_number ASC LIMIT ? OFFSET ?`,
    activityId, limit, offset,
  );
  return rows.map((row) => ({
    id: row.id,
    sequenceNumber: row.sequence_number,
    segmentNumber: row.segment_number,
    latitude: row.latitude,
    longitude: row.longitude,
    timestamp: row.timestamp,
    altitude: row.altitude,
    accuracy: row.accuracy,
    speed: row.speed,
    heading: row.heading,
  }));
}

export async function getPointCountByActivityId(activityId: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM gps_points WHERE activity_id = ?', activityId);
  return row?.count ?? 0;
}

export async function deletePointsByActivityId(activityId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM gps_points WHERE activity_id = ?', activityId);
}
