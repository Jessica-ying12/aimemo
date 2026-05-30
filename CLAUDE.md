# AIMemo

AI 对话知识沉淀桌面应用。Electron + React + TypeScript + SQLite。

## 快速开始

```bash
pnpm install
pnpm dev          # 启动开发环境
pnpm test         # 运行测试
pnpm lint         # 代码检查
pnpm typecheck    # 类型检查
pnpm build:mac    # 打包 macOS 应用
```

## 架构

```
electron/          主进程（Node.js 环境）
  main.ts          入口，创建窗口
  preload.ts       预加载脚本，暴露 IPC API
  ipc-handlers.ts  所有 IPC 处理器（统一用 registerHandler 包装）
  services/
    database/      SQLite 数据库（better-sqlite3）
    collector/     对话采集（文件监控 + 解析器）
    ai/            AI 服务抽象层（Claude / OpenAI）
    processor/     AI 处理队列（标题、摘要、分类、笔记生成）
    embedding/     向量嵌入
    retrieval/     向量检索
    rag/           RAG 问答
    exporter/      导出（Markdown / HTML / PDF）
    config.ts      配置持久化
    logger.ts      日志服务

src/               渲染进程（浏览器环境）
  pages/           页面组件
  components/      可复用组件（按模块分子目录）
  stores/          Zustand 状态管理
  hooks/           自定义 hooks
  lib/api.ts       IPC 调用封装（所有后端调用走这里）

shared/            主进程/渲染进程共享
  types.ts         数据类型定义
  ipc-channels.ts  IPC 通道名称常量
```

## 关键约定

- IPC 通信：渲染进程通过 `src/lib/api.ts` → `window.electronAPI.invoke()` → 主进程 `registerHandler()`
- 数据库：所有写操作包裹在 `db.transaction()` 中
- 错误处理：IPC 层统一 try-catch，返回 `{ success, data, error }`
- 输入校验：IPC handler 用 Zod schema 校验参数
- 日志：用 `logger.info/warn/error(scope, message)`，自动脱敏敏感信息
- 测试：vitest + 内存 SQLite，测试文件在 `tests/`

## 开发规范

- 文件命名：组件 PascalCase.tsx，服务 kebab-case.ts
- 不用 `any`，不用 `default export`（页面组件除外）
- Commit 格式：`type(scope): subject`
- 新增 IPC 接口必须同时更新：ipc-channels.ts + ipc-handlers.ts + api.ts

## 数据库

SQLite + FTS5 全文搜索。迁移文件在 `electron/services/database/migrations/index.ts`。
新增表：追加 migration 对象，version 递增。应用启动时自动执行未运行的迁移。

## 任务文件

开发任务拆分在 `docx/tasks/` 下，按版本分目录，每个 md 文件对应一个 commit。
