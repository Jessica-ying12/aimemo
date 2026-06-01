import { v4 as uuid } from 'uuid';
import { getDatabase } from './index';
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  ListParams,
  PaginatedResult,
} from '../../../shared/types';

export const notesDB = {
  list(params: ListParams = {}): PaginatedResult<Note> {
    const db = getDatabase();
    const { page = 1, pageSize = 20, status, sortBy = 'updated_at', sortOrder = 'desc' } = params;
    const offset = (page - 1) * pageSize;

    let where = '1=1';
    const bindings: unknown[] = [];

    if (status) {
      where += ' AND n.status = ?';
      bindings.push(status);
    }

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM notes n WHERE ${where}`)
      .get(...bindings) as { count: number };

    const rows = db
      .prepare(
        `SELECT n.* FROM notes n WHERE ${where} ORDER BY n.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      )
      .all(...bindings, pageSize, offset) as any[];

    return {
      items: rows.map((row) => mapNote(row, db)),
      total: total.count,
      page,
      pageSize,
    };
  },

  get(id: string): Note | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any;
    return row ? mapNote(row, db) : null;
  },

  create(input: CreateNoteInput): Note {
    const db = getDatabase();
    const id = uuid();
    const now = new Date().toISOString();

    const createTransaction = db.transaction(() => {
      db.prepare(
        `INSERT INTO notes (id, conversation_id, title, content, category, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)`,
      ).run(
        id,
        input.conversationId || null,
        input.title,
        input.content,
        input.category || null,
        now,
        now,
      );

      if (input.tags?.length) {
        const tagStmt = db.prepare(
          'INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)',
        );
        for (const tagId of input.tags) {
          tagStmt.run(id, tagId);
        }
      }

      db.prepare(
        `INSERT INTO notes_fts(rowid, title, content)
        SELECT rowid, title, content FROM notes WHERE id = ?`,
      ).run(id);
    });

    createTransaction();
    return this.get(id)!;
  },

  update(id: string, input: UpdateNoteInput): Note | null {
    const db = getDatabase();
    const now = new Date().toISOString();

    const updateTransaction = db.transaction(() => {
      const sets: string[] = ['updated_at = ?'];
      const bindings: unknown[] = [now];

      if (input.title !== undefined) {
        sets.push('title = ?');
        bindings.push(input.title);
      }
      if (input.content !== undefined) {
        sets.push('content = ?');
        bindings.push(input.content);
      }
      if (input.category !== undefined) {
        sets.push('category = ?');
        bindings.push(input.category);
      }
      if (input.status !== undefined) {
        sets.push('status = ?');
        bindings.push(input.status);
      }

      bindings.push(id);
      db.prepare(`UPDATE notes SET ${sets.join(', ')} WHERE id = ?`).run(...bindings);

      if (input.tags !== undefined) {
        db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(id);
        const tagStmt = db.prepare(
          'INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)',
        );
        for (const tagId of input.tags) {
          tagStmt.run(id, tagId);
        }
      }

      if (input.title !== undefined || input.content !== undefined) {
        const row = db.prepare('SELECT rowid FROM notes WHERE id = ?').get(id) as any;
        if (row) {
          db.prepare('DELETE FROM notes_fts WHERE rowid = ?').run(row.rowid);
          db.prepare(
            `INSERT INTO notes_fts(rowid, title, content)
            SELECT rowid, title, content FROM notes WHERE id = ?`,
          ).run(id);
        }
      }
    });

    updateTransaction();
    return this.get(id);
  },

  delete(id: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  },

  search(query: string, limit = 20): Note[] {
    const db = getDatabase();
    const rows = db
      .prepare(
        `SELECT n.* FROM notes n
      JOIN notes_fts fts ON n.rowid = fts.rowid
      WHERE notes_fts MATCH ?
      ORDER BY rank
      LIMIT ?`,
      )
      .all(query, limit) as any[];
    return rows.map((row) => mapNote(row, db));
  },
};

function mapNote(row: any, db: any): Note {
  const tags = db
    .prepare(
      `SELECT t.name FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?`,
    )
    .all(row.id) as { name: string }[];

  return {
    id: row.id,
    conversationId: row.conversation_id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: tags.map((t) => t.name),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
