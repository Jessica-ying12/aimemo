import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { migrations } from '../../../electron/services/database/migrations';

let db: Database.Database;

beforeEach(() => {
  db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  for (const migration of migrations) {
    migration.up(db);
  }
});

afterEach(() => {
  db.close();
});

describe('database migrations', () => {
  it('should create all expected tables', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const names = tables.map((t) => t.name);

    expect(names).toContain('conversations');
    expect(names).toContain('notes');
    expect(names).toContain('tags');
    expect(names).toContain('note_tags');
  });
});

describe('conversations CRUD', () => {
  it('should insert and retrieve a conversation', () => {
    const id = 'test-1';
    db.prepare(
      `INSERT INTO conversations (id, source, title, raw_content, created_at, imported_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, 'manual', 'Test Title', '[]', '2026-01-01', '2026-01-01');

    const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
    expect(row).toBeDefined();
    expect(row.title).toBe('Test Title');
    expect(row.source).toBe('manual');
  });

  it('should delete a conversation', () => {
    const id = 'test-2';
    db.prepare(
      `INSERT INTO conversations (id, source, title, raw_content, created_at, imported_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, 'manual', 'To Delete', '[]', '2026-01-01', '2026-01-01');

    db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
    expect(row).toBeUndefined();
  });

  it('should support FTS search', () => {
    const id = 'test-fts';
    db.prepare(
      `INSERT INTO conversations (id, source, title, raw_content, created_at, imported_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, 'manual', 'React Hooks 教程', '学习 useEffect', '2026-01-01', '2026-01-01');

    db.prepare(
      `INSERT INTO conversations_fts(rowid, title, raw_content, summary)
      SELECT rowid, title, raw_content, summary FROM conversations WHERE id = ?`,
    ).run(id);

    const results = db
      .prepare(
        `SELECT c.* FROM conversations c
      JOIN conversations_fts fts ON c.rowid = fts.rowid
      WHERE conversations_fts MATCH ?`,
      )
      .all('React') as any[];

    expect(results.length).toBe(1);
    expect(results[0].id).toBe(id);
  });
});
