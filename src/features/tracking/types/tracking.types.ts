export type TrackingStatus = 'idle' | 'recording' | 'paused' | 'finishing' | 'finished';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type GPSPoint = Coordinate & {
  id?: number;
  timestamp: number;
  altitude?: number | null;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
};

export type Activity = {
  id: string;
  startedAt: number;
  endedAt?: number;
  distanceMeters: number;
  elapsedSeconds: number;
  status: TrackingStatus;
  points: GPSPoint[];
};

export type GPSFilterConfig = {
  maxAccuracyMeters: number;
  maxJumpMeters: number;
  maxSpeedMetersPerSecond: number;
  minMovementMeters: number;
};

export const DEFAULT_GPS_FILTER: GPSFilterConfig = {
  maxAccuracyMeters: 80,
  maxJumpMeters: 250,
  maxSpeedMetersPerSecond: 15,
  minMovementMeters: 3,
};
