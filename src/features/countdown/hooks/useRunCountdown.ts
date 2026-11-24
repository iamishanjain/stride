import React from 'react';
import { useTrackingStore } from '../../tracking/state/trackingStore';

export function useRunCountdown() {
  const [target, setTarget] = React.useState<number | null>(null);
  const start = useTrackingStore((state) => state.start);

  const begin = React.useCallback(() => setTarget(Date.now() + 3000), []);
  const complete = React.useCallback(() => {
    setTarget(null);
    start();
  }, [start]);

  return { target, begin, complete };
}
