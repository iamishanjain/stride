import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

export const BACKGROUND_LOCATION_TASK = 'stride-background-location';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('Stride background location task failed', error.message);
    return;
  }
  const locations = (data as { locations?: Location.LocationObject[] } | null)?.locations;
  if (locations?.length) {
    // The foreground engine owns persistence for this milestone. This task is
    // intentionally registered as the extension point for a future durable worker.
    console.info(`Received ${locations.length} background location update(s).`);
  }
});
