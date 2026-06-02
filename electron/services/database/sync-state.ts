import { getDatabase } from './index';

export const syncStateDB = {
  get(filePath: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM sync_state WHERE file_path = ?').get(filePath) as any;
  },

  upsert(filePath: string, source: string, lastModified: string, conversationId?: string) {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO sync_state (file_path, last_modified, last_synced, source, conversation_id)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(file_path) DO UPDATE SET
        last_modified = excluded.last_modified,
        last_synced = excluded.last_synced,
        conversation_id = COALESCE(excluded.conversation_id, conversation_id)`,
    ).run(filePath, lastModified, now, source, conversationId || null);
  },

  hasChanged(filePath: string, currentModified: string): boolean {
    const existing = this.get(filePath);
    if (!existing) return true;
    return existing.last_modified !== currentModified;
  },

  getBySource(source: string) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM sync_state WHERE source = ?').all(source) as any[];
  },
};
