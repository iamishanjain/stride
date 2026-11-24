import React from 'react';
import { useTrackingStore } from '../state/trackingStore';

export function useTrackingTimer() {
  const status = useTrackingStore((state) => state.status);
  const setElapsedSeconds = useTrackingStore((state) => state.setElapsedSeconds);

  React.useEffect(() => {
    if (status !== 'recording' && status !== 'paused') return;
    const timer = setInterval(() => {
      const state = useTrackingStore.getState();
      if (state.startedAt == null) return;
      const pausedSeconds = state.pausedDurationSeconds + (state.pausedAt ? (Date.now() - state.pausedAt) / 1000 : 0);
      setElapsedSeconds((Date.now() - state.startedAt) / 1000 - pausedSeconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [status, setElapsedSeconds]);
}
