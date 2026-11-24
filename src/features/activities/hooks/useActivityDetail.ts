import React from 'react';
import { Activity } from '../../tracking/types/tracking.types';
import { getRouteByActivityId } from '../../../database/repositories/GPSPointRepository';

export function useActivityDetail(activity: Activity) {
  const [routeActivity, setRouteActivity] = React.useState(activity);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    void getRouteByActivityId(activity.id)
      .then((points) => {
        if (!active) return;
        setRouteActivity({
          ...activity,
          points: points.map((point) => ({
            id: point.id,
            timestamp: point.timestamp,
            latitude: point.latitude,
            longitude: point.longitude,
            altitude: point.altitude,
            accuracy: point.accuracy,
            speed: point.speed,
            heading: point.heading,
          })),
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activity]);

  return { routeActivity, loading };
}
