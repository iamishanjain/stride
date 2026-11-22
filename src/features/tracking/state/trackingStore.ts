import { create } from 'zustand';
import { Activity, GPSPoint, TrackingStatus } from '../types/tracking.types';

type TrackingStore = {
  status: TrackingStatus;
  activityId: string | null;
  startedAt: number | null;
  pausedAt: number | null;
  pausedDurationSeconds: number;
  points: GPSPoint[];
  distanceMeters: number;
  elapsedSeconds: number;
  accuracy: number | null;
  lastError: string | null;
  start: () => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  complete: () => void;
  addPoint: (point: GPSPoint, distanceMeters: number) => void;
  setElapsedSeconds: (seconds: number) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

const initialState = {
  status: 'idle' as TrackingStatus,
  activityId: null,
  startedAt: null,
  pausedAt: null,
  pausedDurationSeconds: 0,
  points: [],
  distanceMeters: 0,
  elapsedSeconds: 0,
  accuracy: null,
  lastError: null,
};

export const useTrackingStore = create<TrackingStore>((set) => ({
  ...initialState,
  start: () =>
    set((state) => state.status === 'idle'
      ? {
          status: 'recording',
          activityId: `${Date.now()}`,
          startedAt: Date.now(),
          pausedAt: null,
          pausedDurationSeconds: 0,
          points: [],
          distanceMeters: 0,
          elapsedSeconds: 0,
          lastError: null,
        }
      : state),
  pause: () => set((state) => (state.status === 'recording' ? { status: 'paused', pausedAt: Date.now() } : state)),
  resume: () =>
    set((state) => {
      if (state.status !== 'paused' || state.pausedAt == null) return state;
      return {
        status: 'recording',
        pausedDurationSeconds: state.pausedDurationSeconds + (Date.now() - state.pausedAt) / 1000,
        pausedAt: null,
      };
    }),
  finish: () => set((state) => (state.status === 'recording' || state.status === 'paused' ? { status: 'finishing' } : state)),
  complete: () => set((state) => (state.status === 'finishing' ? { status: 'finished' } : state)),
  addPoint: (point, distanceMeters) =>
    set((state) => (state.status === 'recording'
      ? { points: [...state.points, point], distanceMeters: state.distanceMeters + distanceMeters, accuracy: point.accuracy ?? null }
      : state)),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  setError: (lastError) => set({ lastError }),
  reset: () => set(initialState),
}));

export function storeToActivity(state: TrackingStore): Activity | null {
  if (!state.activityId || state.startedAt == null) return null;
  return {
    id: state.activityId,
    startedAt: state.startedAt,
    distanceMeters: state.distanceMeters,
    elapsedSeconds: state.elapsedSeconds,
    status: state.status,
    points: state.points,
  };
}
