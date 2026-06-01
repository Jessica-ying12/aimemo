import { v4 as uuid } from 'uuid';
import { getDatabase } from './index';
import type { Tag } from '../../../shared/types';

export const tagsDB = {
  list(): Tag[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM tags ORDER BY name').all() as any[];
    return rows.map(mapTag);
  },

  create(name: string, color?: string): Tag {
    const db = getDatabase();
    const id = uuid();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)').run(
      id,
      name,
      color || null,
      now,
    );
    return { id, name, color: color || undefined, createdAt: now };
  },

  findOrCreate(name: string): Tag {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM tags WHERE name = ?').get(name) as any;
    if (existing) return mapTag(existing);
    return this.create(name);
  },

  delete(id: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  },
};

function mapTag(row: any): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  };
}
