import React from 'react';
import { createActivity, getActivityById, saveActivity, saveActivityMetadata } from '../../database/repositories/ActivityRepository';
import { useTracking } from '../../features/tracking/hooks/useTracking';
import { useTrackingTimer } from '../../features/tracking/hooks/useTrackingTimer';
import { storeToActivity, useTrackingStore } from '../../features/tracking/state/trackingStore';
import { pauseActivity, resumeActivity } from '../../database/repositories/PauseRepository';

function formatLocalDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useAppInitialization() {
  useTracking();
  useTrackingTimer();
  const status = useTrackingStore((state) => state.status);
  const previousStatus = React.useRef(status);
  const distanceMeters = useTrackingStore((state) => state.distanceMeters);
  const elapsedSeconds = useTrackingStore((state) => state.elapsedSeconds);
  const complete = useTrackingStore((state) => state.complete);

  React.useEffect(() => {
    const state = useTrackingStore.getState();
    if (!state.activityId) return;
    if (previousStatus.current === 'recording' && status === 'paused') {
      void pauseActivity(state.activityId).catch((error: unknown) =>
        useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to save pause interval.'));
    }
    if (previousStatus.current === 'paused' && status === 'recording') {
      void resumeActivity(state.activityId).catch((error: unknown) =>
        useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to save resume interval.'));
    }
    previousStatus.current = status;
  }, [status]);

  React.useEffect(() => {
    const state = useTrackingStore.getState();
    if (status === 'recording' && state.activityId && state.startedAt) {
      void getActivityById(state.activityId)
        .then(async (activity) => {
          if (!activity) {
            await createActivity({
              id: state.activityId!,
              startedAt: state.startedAt!,
              distanceMeters,
              elapsedSeconds,
              timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
              localDate: formatLocalDate(state.startedAt!),
            });
            return;
          }
          await saveActivityMetadata({
            id: state.activityId!,
            startedAt: state.startedAt!,
            distanceMeters,
            elapsedSeconds,
            status,
          });
        })
        .catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to initialize local run storage.'));
    }
  }, [status, distanceMeters, elapsedSeconds]);

  React.useEffect(() => {
    if (status !== 'finishing') return;
    const activity = storeToActivity(useTrackingStore.getState());
    if (!activity) return;
    void saveActivity({ ...activity, status: 'finished' })
      .then(() => complete())
      .catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to save this run.'));
  }, [status, complete]);
}
