# 依赖管理与数据库迁移规范

## 依赖管理

### 添加新依赖前必须确认

1. **是否真的需要？** — 能用 10 行代码解决的不引入库
2. **是否活跃维护？** — GitHub 最近 6 个月有 commit
3. **包体积多大？** — `npx bundlephobia <package>` 查看
4. **是否有已知漏洞？** — `pnpm audit` 检查
5. **是否与 Electron 兼容？** — 特别是 native 模块

### 包体积预算

| 类别 | 预算 |
|------|------|
| 单个依赖 | < 500KB (gzipped) |
| 总 node_modules | < 300MB |
| 打包后应用 | < 200MB |

### 版本锁定

- 使用精确版本（`"react": "18.3.1"`），不用 `^` 或 `~`
- 安装后确认 `pnpm-lock.yaml` 已更新并提交
- 升级依赖单独一个 commit：`chore: upgrade xxx to vX.Y.Z`

### 已选定的核心依赖（不要替换）

| 用途 | 库 | 原因 |
|------|---|------|
| 构建 | electron-vite | Electron 专用，统一管理三端构建 |
| 数据库 | better-sqlite3 | 同步 API，性能好，Electron 兼容 |
| 状态管理 | zustand | 轻量，无 boilerplate |
| 路由 | react-router-dom | 生态成熟 |
| 样式 | tailwindcss | 原子化，无运行时开销 |
| 校验 | zod | TypeScript 优先，体积小 |
| 文件监控 | chokidar | 比 fs.watch 可靠 |
| AI SDK | @anthropic-ai/sdk, openai | 官方 SDK |

---

## 数据库迁移工作流

### 添加新迁移

1. 打开 `electron/services/database/migrations/index.ts`
2. 在 `migrations` 数组末尾追加新对象
3. `version` 必须递增（当前最大 version + 1）
4. `name` 用 snake_case 描述变更

```typescript
{
  version: 4,  // 递增！
  name: 'add_chat_history',
  up: (db) => {
    db.exec(`
      CREATE TABLE chat_sessions ( ... );
      CREATE TABLE chat_history ( ... );
      CREATE INDEX idx_chat_history_session ON chat_history(session_id);
    `);
  },
},
```

### 迁移规则

- **只追加，不修改已有迁移** — 已发布的迁移不能改
- **每个迁移必须幂等** — 用 `CREATE TABLE IF NOT EXISTS` 或先检查
- **不删除用户数据** — 删列/删表需要先迁移数据
- **大表变更要考虑性能** — 添加索引用 `CREATE INDEX IF NOT EXISTS`
- **测试迁移** — 在空数据库和已有数据的数据库上都测试

### 迁移测试

```typescript
// tests/unit/database/migrations.test.ts
it('should run all migrations on empty database', () => {
  const db = new Database(':memory:');
  runMigrations(db); // 不应抛错
  db.close();
});

it('should be idempotent', () => {
  const db = new Database(':memory:');
  runMigrations(db);
  runMigrations(db); // 第二次不应抛错
  db.close();
});
```

### 回滚策略

本项目不实现自动回滚。如果迁移出错：
1. 从备份恢复数据库
2. 修复迁移代码
3. 重新运行

生产环境发布前：
- 在测试数据库上验证迁移
- 确保有最新备份
- 迁移失败时应用应能启动（降级模式）

### 字段变更注意事项

| 操作 | 风险 | 处理方式 |
|------|------|---------|
| 新增表 | 低 | 直接 CREATE TABLE |
| 新增列 | 低 | ALTER TABLE ADD COLUMN（SQLite 支持） |
| 新增索引 | 低 | CREATE INDEX IF NOT EXISTS |
| 删除列 | 高 | SQLite 不支持 DROP COLUMN（需重建表） |
| 修改列类型 | 高 | 需重建表 |
| 删除表 | 高 | 确认无引用后再删 |
