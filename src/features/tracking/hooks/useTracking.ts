import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useTrackingStore } from '../state/trackingStore';
import { haversineDistanceMeters } from '../services/DistanceCalculator';
import { processGPSPoint } from '../services/GPSProcessor';
import { appendGPSPoint } from '../../../database/repositories/ActivityRepository';
import { GPSPoint } from '../types/tracking.types';

function GPSPointFromLocation(location: Location.LocationObject): GPSPoint {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    timestamp: location.timestamp,
    altitude: location.coords.altitude,
    accuracy: location.coords.accuracy,
    speed: location.coords.speed,
    heading: location.coords.heading,
  };
}

export function useTracking(): void {
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const previousPoint = useRef<ReturnType<typeof processGPSPoint>>(null);
  const segmentNumber = useRef(0);
  const previousStatus = useRef(useTrackingStore.getState().status);
  const addPoint = useTrackingStore((state) => state.addPoint);
  const activityId = useTrackingStore((state) => state.activityId);
  const setCurrentLocation = useTrackingStore((state) => state.setCurrentLocation);
  const setError = useTrackingStore((state) => state.setError);

  useEffect(() => {
    let active = true;
    previousPoint.current = null;

    void (async () => {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (!active) return;
      if (permission !== Location.PermissionStatus.GRANTED) {
        setError('Location permission is required to record a run.');
        return;
      }
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });
        if (!active) return;
        const point = GPSPointFromLocation(location);
        setCurrentLocation(point);
      } catch (error: unknown) {
        if (active) setError(error instanceof Error ? error.message : 'Unable to determine your location.');
      }

      subscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1, timeInterval: 2000 },
        (location) => {
          if (!active) return;
          const point = GPSPointFromLocation(location);
          const currentStatus = useTrackingStore.getState().status;
          if (previousStatus.current !== 'recording' && currentStatus === 'recording') {
            segmentNumber.current += 1;
          }
          previousStatus.current = currentStatus;
          setCurrentLocation(point);
          if (useTrackingStore.getState().status !== 'recording') return;
          const filteredPoint = processGPSPoint(location, previousPoint.current ?? undefined);
          if (!filteredPoint) return;
          const distance = previousPoint.current ? haversineDistanceMeters(previousPoint.current, filteredPoint) : 0;
          previousPoint.current = filteredPoint;
          const segmentedPoint = { ...filteredPoint, segmentNumber: segmentNumber.current };
          addPoint(segmentedPoint, distance);
          if (activityId) {
            void appendGPSPoint(activityId, segmentedPoint).catch((error: unknown) =>
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
  }, [addPoint, activityId, setError, setCurrentLocation]);

}
