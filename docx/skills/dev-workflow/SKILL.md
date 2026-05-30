---
name: dev-workflow
description: "AIMemo 项目开发工作流。当开发者要开始一个新任务、创建文件、写代码时使用。包含文件创建规范、目录约定、代码风格、commit 规范。每次开发新功能前调用此 skill 获取规范指导。"
version: 1.0.0
---

# AIMemo 开发工作流

## 概述
此 skill 定义了 AIMemo 项目的开发规范，确保每次开发都遵循统一标准。

## 路由
| 场景 | 操作 |
|------|------|
| 创建新文件 | 读取 [file-creation.md](references/file-creation.md) |
| 写代码 | 读取 [code-style.md](references/code-style.md) |
| 提交代码 | 读取 [commit-rules.md](references/commit-rules.md) |
| Git 分支管理 | 读取 [git-branching.md](references/git-branching.md) |
| 新增功能模块 | 读取 [module-pattern.md](references/module-pattern.md) |
| 依赖和数据库迁移 | 读取 [deps-and-migrations.md](references/deps-and-migrations.md) |

## 核心规则

### 文件创建规范

| 文件类型 | 命名 | 位置 |
|---------|------|------|
| React 页面组件 | PascalCase.tsx | `src/pages/` |
| React 通用组件 | PascalCase.tsx | `src/components/{模块}/` |
| Zustand Store | camelCaseStore.ts | `src/stores/` |
| 自定义 Hook | useXxx.ts | `src/hooks/` |
| 工具函数 | kebab-case.ts | `src/lib/` |
| 主进程服务 | kebab-case.ts | `electron/services/{模块}/` |
| 数据库操作 | 实体名.ts | `electron/services/database/` |
| 数据库迁移 | {version}_{name}.ts | `electron/services/database/migrations/` |
| 共享类型 | kebab-case.ts | `shared/` |
| 单元测试 | {被测文件}.test.ts | `tests/unit/{模块}/` |
| IPC 处理器 | 统一在 ipc-handlers.ts | `electron/` |

### 代码风格

- TypeScript strict mode，不允许 any（除非有注释说明原因）
- 函数优先于类（除非需要继承，如 BaseCollector）
- 导出具名函数/对象，不用 default export（除 React 页面组件）
- 错误处理：主进程用 try-catch + logger，IPC 层用 wrapHandler
- 异步操作一律 async/await，不用 .then() 链

### Commit 规范

```
<type>(<scope>): <subject>
```

type: feat | fix | refactor | style | docs | test | chore | perf
scope: collector | db | ai | ui | ipc | export | rag | config | privacy | updater

### 开发一个新功能的标准流程

1. 从 `develop` 创建 feature 分支
2. 查看对应的 task 文件（`docx/tasks/vX.Y/NNN-xxx.md`）
3. 按步骤实现
4. 写测试（至少覆盖核心逻辑）
5. `pnpm lint && pnpm typecheck && pnpm test`
6. 按 task 文件中的 commit message 提交
7. 推送并创建 PR

## 文件
| 文件 | 内容 |
|------|------|
| [file-creation.md](references/file-creation.md) | 文件创建详细规范 |
| [code-style.md](references/code-style.md) | 代码风格详细规范 |
| [commit-rules.md](references/commit-rules.md) | 提交规范详细说明 |
| [git-branching.md](references/git-branching.md) | Git 分支管理完整规范 |
| [module-pattern.md](references/module-pattern.md) | 新模块标准模式 |
| [deps-and-migrations.md](references/deps-and-migrations.md) | 依赖管理与数据库迁移 |
