import { Activity, GPSPoint } from '../types/tracking.types';
import { haversineDistanceMeters } from './DistanceCalculator';

export type Split = {
  index: number;
  label: string;
  distanceMeters: number;
  elapsedSeconds: number;
  paceSecondsPerKm: number;
  elevationGainMeters: number;
};

export function formatPace(secondsPerKm: number): string {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return '--';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function calculateSplits(activity: Activity): Split[] {
  const points = activity.points;
  if (!points.length) return [];

  const splits: Split[] = [];
  let splitStartIndex = 0;
  let splitDistance = 0;
  let previousElevation = points[0].altitude ?? 0;
  let elevationGain = 0;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    const segmentDistance = haversineDistanceMeters(previous, point);
    splitDistance += segmentDistance;
    if ((point.altitude ?? 0) > previousElevation) elevationGain += (point.altitude ?? 0) - previousElevation;
    previousElevation = point.altitude ?? previousElevation;

    if (splitDistance >= 1000 || index === points.length - 1) {
      const start = points[splitStartIndex];
      const elapsedSeconds = Math.max(0, (point.timestamp - start.timestamp) / 1000);
      splits.push({
        index: splits.length + 1,
        label: splitDistance >= 995 ? String(splits.length + 1) : (splitDistance / 1000).toFixed(1),
        distanceMeters: splitDistance,
        elapsedSeconds,
        paceSecondsPerKm: elapsedSeconds / (splitDistance / 1000),
        elevationGainMeters: elevationGain,
      });
      splitStartIndex = index;
      splitDistance = 0;
      elevationGain = 0;
    }
  }
  return splits;
}

export function getElevationStats(points: GPSPoint[]) {
  let gain = 0;
  let max = -Infinity;
  let previous = points[0]?.altitude ?? 0;
  for (const point of points) {
    const elevation = point.altitude ?? previous;
    max = Math.max(max, elevation);
    if (elevation > previous) gain += elevation - previous;
    previous = elevation;
  }
  return { gain: Number.isFinite(gain) ? gain : 0, max: Number.isFinite(max) ? max : 0 };
}
