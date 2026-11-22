import { Coordinate, GPSPoint, GPSFilterConfig } from '../types/tracking.types';

const EARTH_RADIUS_METERS = 6_371_000;

export function haversineDistanceMeters(a: Coordinate, b: Coordinate): number {
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function isValidCoordinate(point: Coordinate): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

export function isAcceptablePoint(
  point: GPSPoint,
  previous: GPSPoint | undefined,
  config: GPSFilterConfig,
): boolean {
  if (!isValidCoordinate(point) || !Number.isFinite(point.timestamp)) return false;
  if (point.accuracy != null && (!Number.isFinite(point.accuracy) || point.accuracy > config.maxAccuracyMeters)) return false;
  if (!previous) return true;
  if (point.timestamp <= previous.timestamp) return false;
  const distance = haversineDistanceMeters(previous, point);
  if (distance < config.minMovementMeters) return false;
  const seconds = (point.timestamp - previous.timestamp) / 1000;
  if (distance > config.maxJumpMeters || distance / seconds > config.maxSpeedMetersPerSecond) return false;
  return true;
}

export function accumulateDistance(points: GPSPoint[], config: GPSFilterConfig): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    if (isAcceptablePoint(points[index], points[index - 1], config)) {
      total += haversineDistanceMeters(points[index - 1], points[index]);
    }
  }
  return total;
}
