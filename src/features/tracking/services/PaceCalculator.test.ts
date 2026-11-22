import { averagePaceMinutesPerKilometer, formatDuration, formatPace } from './PaceCalculator';

describe('PaceCalculator', () => {
  it('calculates average pace', () => {
    expect(averagePaceMinutesPerKilometer(5000, 1500)).toBe(5);
    expect(formatPace(5.5)).toBe('5:30');
  });

  it('formats duration and handles empty runs', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(averagePaceMinutesPerKilometer(0, 100)).toBeNull();
    expect(formatPace(null)).toBe('--:--');
  });
});
