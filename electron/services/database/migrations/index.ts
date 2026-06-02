import type Database from 'better-sqlite3';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: (db) => {
      db.exec(`
        CREATE TABLE conversations (
          id TEXT PRIMARY KEY,
          source TEXT NOT NULL,
          title TEXT,
          raw_content TEXT NOT NULL,
          summary TEXT,
          created_at TEXT NOT NULL,
          imported_at TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          metadata TEXT
        );

        CREATE TABLE notes (
          id TEXT PRIMARY KEY,
          conversation_id TEXT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT,
          status TEXT DEFAULT 'draft',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        );

        CREATE TABLE tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          color TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE note_tags (
          note_id TEXT NOT NULL,
          tag_id TEXT NOT NULL,
          PRIMARY KEY (note_id, tag_id),
          FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

        CREATE VIRTUAL TABLE conversations_fts USING fts5(
          title, raw_content, summary,
          content=conversations,
          content_rowid=rowid
        );

        CREATE VIRTUAL TABLE notes_fts USING fts5(
          title, content,
          content=notes,
          content_rowid=rowid
        );

        CREATE INDEX idx_conversations_source ON conversations(source);
        CREATE INDEX idx_conversations_status ON conversations(status);
        CREATE INDEX idx_conversations_created_at ON conversations(created_at);
        CREATE INDEX idx_notes_conversation_id ON notes(conversation_id);
        CREATE INDEX idx_notes_category ON notes(category);
        CREATE INDEX idx_notes_status ON notes(status);
      `);
    },
  },
  {
    version: 2,
    name: 'add_sync_state',
    up: (db) => {
      db.exec(`
        CREATE TABLE sync_state (
          file_path TEXT PRIMARY KEY,
          last_modified TEXT NOT NULL,
          last_synced TEXT NOT NULL,
          source TEXT NOT NULL,
          conversation_id TEXT,
          file_hash TEXT,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        );

        CREATE INDEX idx_sync_state_source ON sync_state(source);
      `);
    },
  },
];
