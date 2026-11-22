import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useTrackingStore } from '../state/trackingStore';
import { haversineDistanceMeters } from '../services/DistanceCalculator';
import { processGPSPoint } from '../services/GPSProcessor';
import { appendGPSPoint } from '../../../database/repositories/ActivityRepository';

export function useTracking(): void {
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const previousPoint = useRef<ReturnType<typeof processGPSPoint>>(null);
  const status = useTrackingStore((state) => state.status);
  const addPoint = useTrackingStore((state) => state.addPoint);
  const activityId = useTrackingStore((state) => state.activityId);
  const setError = useTrackingStore((state) => state.setError);

  useEffect(() => {
    let active = true;
    if (status !== 'recording') {
      subscription.current?.remove();
      subscription.current = null;
      previousPoint.current = null;
      return () => { active = false; };
    }

    void (async () => {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (!active) return;
      if (permission !== Location.PermissionStatus.GRANTED) {
        setError('Location permission is required to record a run.');
        return;
      }
      subscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 3, timeInterval: 3000 },
        (location) => {
          const point = processGPSPoint(location, previousPoint.current ?? undefined);
          if (!point) return;
          const distance = previousPoint.current ? haversineDistanceMeters(previousPoint.current, point) : 0;
          previousPoint.current = point;
          addPoint(point, distance);
          if (activityId) {
            void appendGPSPoint(activityId, point).catch((error: unknown) =>
              setError(error instanceof Error ? `GPS point could not be saved: ${error.message}` : 'GPS point could not be saved.'),
            );
          }
        },
      );
    })().catch((error: unknown) => setError(error instanceof Error ? error.message : 'Unable to start GPS tracking.'));

    return () => {
      active = false;
      subscription.current?.remove();
      subscription.current = null;
    };
  }, [status, addPoint, activityId, setError]);

}
