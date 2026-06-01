import { v4 as uuid } from 'uuid';
import { getDatabase } from './index';
import type {
  Conversation,
  CreateConversationInput,
  ListParams,
  PaginatedResult,
} from '../../../shared/types';

export const conversationsDB = {
  list(params: ListParams = {}): PaginatedResult<Conversation> {
    const db = getDatabase();
    const {
      page = 1,
      pageSize = 20,
      source,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;
    const offset = (page - 1) * pageSize;

    let where = '1=1';
    const bindings: unknown[] = [];

    if (source) {
      where += ' AND source = ?';
      bindings.push(source);
    }
    if (status) {
      where += ' AND status = ?';
      bindings.push(status);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM conversations WHERE ${where}`)
      .get(...bindings) as { count: number };

    const rows = db
      .prepare(
        `SELECT * FROM conversations WHERE ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      )
      .all(...bindings, pageSize, offset) as any[];

    return {
      items: rows.map(mapConversation),
      total: total.count,
      page,
      pageSize,
    };
  },

  get(id: string): Conversation | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
    return row ? mapConversation(row) : null;
  },

  create(input: CreateConversationInput): Conversation {
    const db = getDatabase();
    const id = uuid();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO conversations (id, source, title, raw_content, created_at, imported_at, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    ).run(
      id,
      input.source,
      input.title || '',
      JSON.stringify(input.rawContent),
      now,
      now,
      input.metadata ? JSON.stringify(input.metadata) : null,
    );

    db.prepare(
      `INSERT INTO conversations_fts(rowid, title, raw_content, summary)
      SELECT rowid, title, raw_content, summary FROM conversations WHERE id = ?`,
    ).run(id);

    return this.get(id)!;
  },

  delete(id: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
  },

  search(query: string, limit = 20): Conversation[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT c.* FROM conversations c
      JOIN conversations_fts fts ON c.rowid = fts.rowid
      WHERE conversations_fts MATCH ?
      ORDER BY rank
      LIMIT ?`,
      )
      .all(query, limit) as any[];
    return rows.map(mapConversation);
  },
};

function mapConversation(row: any): Conversation {
  return {
    id: row.id,
    source: row.source,
    title: row.title,
    rawContent: JSON.parse(row.raw_content),
    summary: row.summary,
    createdAt: row.created_at,
    importedAt: row.imported_at,
    status: row.status,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  };
}
