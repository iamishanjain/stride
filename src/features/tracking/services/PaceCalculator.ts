export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

export function averagePaceMinutesPerKilometer(distanceMeters: number, elapsedSeconds: number): number | null {
  if (distanceMeters <= 0 || elapsedSeconds <= 0) return null;
  return elapsedSeconds / 60 / (distanceMeters / 1000);
}

export function formatPace(paceMinutes: number | null): string {
  if (paceMinutes == null || !Number.isFinite(paceMinutes)) return '--:--';
  const minutes = Math.floor(paceMinutes);
  const seconds = Math.round((paceMinutes - minutes) * 60);
  return `${minutes}:${String(seconds === 60 ? 0 : seconds).padStart(2, '0')}`;
}

export function averageSpeedKmh(distanceMeters: number, elapsedSeconds: number): number {
  if (distanceMeters <= 0 || elapsedSeconds <= 0) return 0;
  return (distanceMeters / 1000) / (elapsedSeconds / 3600);
}
