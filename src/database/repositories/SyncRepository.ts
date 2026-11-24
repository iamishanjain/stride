import { getDatabase } from '../database';

export async function enqueue(input: {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload?: string | null;
}): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT OR IGNORE INTO sync_queue
      (id, entity_type, entity_id, operation, payload, status, retry_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
    input.id,
    input.entityType,
    input.entityId,
    input.operation,
    input.payload ?? null,
    now,
    now,
  );
}
