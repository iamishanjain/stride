import React from 'react';
import { Activity } from '../../tracking/types/tracking.types';
import { getRecentActivities } from '../../../database/repositories/ActivityRepository';
import { useTrackingStore } from '../../tracking/state/trackingStore';

export function useActivities(refreshKey?: string) {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void getRecentActivities()
      .then(setActivities)
      .catch((error: unknown) => useTrackingStore.getState().setError(error instanceof Error ? error.message : 'Unable to load previous runs.'))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return { activities, loading };
}
