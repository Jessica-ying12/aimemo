# 数据库测试方法

## 核心原则

- 使用内存 SQLite（`:memory:`），不碰真实数据库
- 每个测试用例独立的数据库实例
- 测试前运行迁移，测试后关闭连接

## 测试数据库工具

```typescript
// tests/helpers/test-db.ts
import Database from 'better-sqlite3';
import { migrations } from '../../electron/services/database/migrations';

export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  for (const migration of migrations) {
    migration.up(db);
  }

  return db;
}
```

## 测试模式

### 方式 1：直接操作数据库（推荐用于测试 SQL 逻辑）

```typescript
describe('conversations table', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDatabase();
  });

  afterEach(() => {
    db.close();
  });

  it('should insert and query', () => {
    db.prepare('INSERT INTO conversations ...').run(...);
    const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
    expect(row).toBeDefined();
  });
});
```

### 方式 2：测试 CRUD 服务层（需要依赖注入）

为了让 CRUD 层可测试，服务函数应接受 db 参数或使用可替换的 getter：

```typescript
// 重构建议：让 getDatabase() 可被测试替换
let dbInstance: Database.Database | null = null;

export function setDatabase(db: Database.Database) {
  dbInstance = db;
}

export function getDatabase(): Database.Database {
  if (!dbInstance) throw new Error('Database not initialized');
  return dbInstance;
}

// 测试中：
beforeEach(() => {
  const testDb = createTestDatabase();
  setDatabase(testDb);
});
```

## 测试迁移

```typescript
describe('database migrations', () => {
  it('should be idempotent', () => {
    const db = new Database(':memory:');

    // 运行两次不应报错
    for (const migration of migrations) {
      migration.up(db);
    }
    for (const migration of migrations) {
      // 第二次应该跳过（由 migrator 控制）
    }

    db.close();
  });

  it('should create all expected tables', () => {
    const db = createTestDatabase();
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];

    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain('conversations');
    expect(tableNames).toContain('notes');
    expect(tableNames).toContain('tags');
    expect(tableNames).toContain('note_tags');

    db.close();
  });
});
```

## 测试 FTS

```typescript
it('should find conversations by full-text search', () => {
  const db = createTestDatabase();

  // 插入数据
  db.prepare('INSERT INTO conversations ...').run(...);

  // 手动更新 FTS（生产中由 trigger 或应用代码完成）
  db.prepare(`
    INSERT INTO conversations_fts(rowid, title, raw_content, summary)
    SELECT rowid, title, raw_content, summary FROM conversations
  `).run();

  // 搜索
  const results = db.prepare(`
    SELECT c.* FROM conversations c
    JOIN conversations_fts fts ON c.rowid = fts.rowid
    WHERE conversations_fts MATCH ?
  `).all('搜索关键词');

  expect(results.length).toBeGreaterThan(0);
  db.close();
});
```

## 测试事务

```typescript
it('should rollback on error', () => {
  const db = createTestDatabase();

  try {
    const tx = db.transaction(() => {
      db.prepare('INSERT INTO conversations ...').run(...);
      throw new Error('Simulated failure');
    });
    tx();
  } catch {
    // 预期抛错
  }

  // 数据应该回滚
  const count = db.prepare('SELECT COUNT(*) as c FROM conversations').get() as { c: number };
  expect(count.c).toBe(0);

  db.close();
});
```
