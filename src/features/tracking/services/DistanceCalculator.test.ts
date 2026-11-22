import { accumulateDistance, haversineDistanceMeters, isAcceptablePoint } from './DistanceCalculator';
import { DEFAULT_GPS_FILTER, GPSPoint } from '../types/tracking.types';

const point = (latitude: number, longitude: number, timestamp: number, accuracy = 5): GPSPoint => ({
  latitude, longitude, timestamp, accuracy,
});

describe('DistanceCalculator', () => {
  it('calculates the distance between two coordinates', () => {
    expect(haversineDistanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0.01 })).toBeCloseTo(1111.9, 0);
  });

  it('accumulates accepted movement and rejects jitter', () => {
    const points = [point(0, 0, 1000), point(0, 0.00001, 2000), point(0, 0.001, 30000)];
    expect(accumulateDistance(points, DEFAULT_GPS_FILTER)).toBeGreaterThan(90);
    expect(isAcceptablePoint(points[1], points[0], DEFAULT_GPS_FILTER)).toBe(false);
  });

  it('rejects jumps and invalid timestamps', () => {
    expect(isAcceptablePoint(point(2, 2, 2000), point(0, 0, 1000), DEFAULT_GPS_FILTER)).toBe(false);
    expect(isAcceptablePoint(point(0, 0.001, 500), point(0, 0, 1000), DEFAULT_GPS_FILTER)).toBe(false);
  });
});
