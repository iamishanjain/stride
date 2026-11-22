import { LocationObject } from 'expo-location';
import { DEFAULT_GPS_FILTER, GPSFilterConfig, GPSPoint } from '../types/tracking.types';
import { isAcceptablePoint } from './DistanceCalculator';

export function toGPSPoint(location: LocationObject): GPSPoint {
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

export function processGPSPoint(
  location: LocationObject,
  previous: GPSPoint | undefined,
  config: GPSFilterConfig = DEFAULT_GPS_FILTER,
): GPSPoint | null {
  const point = toGPSPoint(location);
  return isAcceptablePoint(point, previous, config) ? point : null;
}
