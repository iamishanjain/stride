export type ValidRoutePoint = {
  sequenceNumber: number;
  segmentNumber: number;
  latitude: number;
  longitude: number;
};

export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude)
    && latitude >= -90
    && latitude <= 90
    && Number.isFinite(longitude)
    && longitude >= -180
    && longitude <= 180;
}

export function getRouteSegments<T extends ValidRoutePoint>(points: T[]): T[][] {
  const segments = new Map<number, T[]>();
  for (const point of [...points]
    .sort((left, right) => left.sequenceNumber - right.sequenceNumber)
    .filter((point) => isValidCoordinate(point.latitude, point.longitude))) {
    const segment = segments.get(point.segmentNumber) ?? [];
    segment.push(point);
    segments.set(point.segmentNumber, segment);
  }
  return Array.from(segments.entries())
    .sort(([left], [right]) => left - right)
    .map(([, segment]) => segment);
}
