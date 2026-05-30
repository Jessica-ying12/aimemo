# Commit 规范

## 格式

```
<type>(<scope>): <subject>
```

- subject：小写开头，不加句号，不超过 72 字符
- 用英文写 commit message

## Type

| type | 何时用 |
|------|--------|
| feat | 新功能、新文件、新接口 |
| fix | 修复 bug |
| refactor | 重构（不改功能、不修 bug） |
| perf | 性能优化 |
| style | 代码格式（不影响逻辑） |
| test | 添加/修改测试 |
| docs | 文档 |
| chore | 构建、依赖、配置 |

## Scope

| scope | 对应模块 |
|-------|---------|
| collector | electron/services/collector/ |
| db | electron/services/database/ |
| ai | electron/services/ai/ + processor/ |
| ui | src/components/ + src/pages/ |
| ipc | electron/ipc-handlers + shared/ipc-channels |
| export | electron/services/exporter/ |
| rag | electron/services/embedding/ + retrieval/ + rag/ |
| config | electron/services/config + 设置页面 |
| privacy | electron/services/privacy/ |
| updater | electron/updater.ts |

scope 可省略（如 chore 类型通常不需要）。

## 示例

```
feat(collector): implement Claude Code conversation parser
fix(db): wrap multi-step operations in transactions
refactor(ai): extract common prompt builder
chore: upgrade electron to v30
test(collector): add watcher unit tests
perf(db): add composite index for filtered queries
```

## 禁止

- 不要写 "update code" / "fix bug" / "add feature" 这种无意义描述
- 不要一个 commit 包含多个不相关的改动
- 不要 commit 编译产物（out/、release/）
- 不要 commit .env 或含有 API Key 的文件
