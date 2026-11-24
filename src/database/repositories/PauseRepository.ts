import { getDatabase } from '../database';

export async function pauseActivity(activityId: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const activity = await db.getFirstAsync<{ status: string }>('SELECT status FROM activities WHERE id = ?', activityId);
    if (!activity || (activity.status !== 'recording' && activity.status !== 'paused')) throw new Error('Only recording or paused activities can be paused.');
    const open = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM activity_pause_intervals WHERE activity_id = ? AND resumed_at IS NULL',
      activityId,
    );
    if (open) throw new Error('Activity is already paused.');
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO activity_pause_intervals (id, activity_id, paused_at, created_at) VALUES (?, ?, ?, ?)`,
      `${activityId}-pause-${now}`, activityId, now, now,
    );
    await db.runAsync("UPDATE activities SET status = 'paused', updated_at = ? WHERE id = ?", now, activityId);
  });
}

export async function resumeActivity(activityId: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const interval = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM activity_pause_intervals WHERE activity_id = ? AND resumed_at IS NULL',
      activityId,
    );
    if (!interval) throw new Error('No open pause interval exists.');
    const now = Date.now();
    await db.runAsync(
      'UPDATE activity_pause_intervals SET resumed_at = ? WHERE id = ?',
      now,
      interval.id,
    );
    await db.runAsync("UPDATE activities SET status = 'recording', updated_at = ? WHERE id = ?", now, activityId);
  });
}

export async function getTotalPausedDuration(activityId: string): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ paused_at: number; resumed_at: number | null }>(
    'SELECT paused_at, resumed_at FROM activity_pause_intervals WHERE activity_id = ?',
    activityId,
  );
  const now = Date.now();
  return rows.reduce((total, row) => total + Math.max(0, (row.resumed_at ?? now) - row.paused_at), 0);
}
