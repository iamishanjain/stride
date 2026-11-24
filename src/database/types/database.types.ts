export type ActivityStatus = 'recording' | 'paused' | 'completed' | 'discarded';
export type TrackingStatus = ActivityStatus | 'finishing';
export type SportType = 'running' | 'walking' | 'cycling' | 'hiking' | 'other';
export type ActivityVisibility = 'private' | 'followers' | 'public';

export type DatabaseActivity = {
  id: string;
  userId: string | null;
  title: string | null;
  sportType: SportType;
  startedAt: number;
  endedAt: number | null;
  distanceMeters: number;
  elapsedSeconds: number;
  movingSeconds: number;
  avgPaceSecondsPerKm: number | null;
  bestPaceSecondsPerKm: number | null;
  avgSpeedMps: number | null;
  maxSpeedMps: number | null;
  elevationGainMeters: number;
  elevationLossMeters: number;
  status: ActivityStatus;
  visibility: ActivityVisibility;
  notes: string | null;
  timezoneOffsetMinutes: number | null;
  localDate: string | null;
  createdAt: number;
  updatedAt: number;
};

export type GPSPointInsert = {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number | null;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  segmentNumber?: number;
};

export type ActivityRoutePoint = GPSPointInsert & {
  id: number;
  sequenceNumber: number;
  segmentNumber: number;
};
