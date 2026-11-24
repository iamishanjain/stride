import { getRouteSegments, isValidCoordinate } from './databaseUtils';

describe('database route utilities', () => {
  it('filters invalid GPS coordinates', () => {
    expect(isValidCoordinate(20, 80)).toBe(true);
    expect(isValidCoordinate(91, 80)).toBe(false);
    expect(isValidCoordinate(20, 181)).toBe(false);
  });

  it('reconstructs ordered route segments', () => {
    const segments = getRouteSegments([
      { sequenceNumber: 3, segmentNumber: 1, latitude: 20.3, longitude: 80.3 },
      { sequenceNumber: 1, segmentNumber: 0, latitude: 20.1, longitude: 80.1 },
      { sequenceNumber: 2, segmentNumber: 0, latitude: 20.2, longitude: 80.2 },
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0].map((point) => point.sequenceNumber)).toEqual([1, 2]);
    expect(segments[1].map((point) => point.sequenceNumber)).toEqual([3]);
  });

  it('removes invalid coordinates before segmentation', () => {
    const segments = getRouteSegments([
      { sequenceNumber: 1, segmentNumber: 0, latitude: 20.1, longitude: 80.1 },
      { sequenceNumber: 2, segmentNumber: 0, latitude: 91, longitude: 80.2 },
    ]);
    expect(segments).toEqual([
      [{ sequenceNumber: 1, segmentNumber: 0, latitude: 20.1, longitude: 80.1 }],
    ]);
  });
});
