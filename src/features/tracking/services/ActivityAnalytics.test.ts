import { calculateSplits, getElevationStats } from './ActivityAnalytics';
import { Activity } from '../types/tracking.types';

describe('activity analytics', () => {
  it('returns no splits for an activity without GPS points', () => {
    const activity: Activity = {
      id: 'empty',
      startedAt: 0,
      distanceMeters: 0,
      elapsedSeconds: 0,
      status: 'finished',
      points: [],
    };
    expect(calculateSplits(activity)).toEqual([]);
  });

  it('calculates elevation gain without negative elevation deltas', () => {
    const stats = getElevationStats([
      { latitude: 0, longitude: 0, timestamp: 0, altitude: 100 },
      { latitude: 0, longitude: 0, timestamp: 1000, altitude: 125 },
      { latitude: 0, longitude: 0, timestamp: 2000, altitude: 120 },
      { latitude: 0, longitude: 0, timestamp: 3000, altitude: 140 },
    ]);
    expect(stats.gain).toBe(45);
    expect(stats.max).toBe(140);
  });
});
