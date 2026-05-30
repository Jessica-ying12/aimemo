---
name: code-review
description: "AIMemo 项目代码审查。当需要审查代码变更、PR、或提交前检查时使用。包含安全检查、性能检查、规范检查的完整清单。每次提交代码前或审查 PR 时调用。"
version: 1.0.0
---

# AIMemo 代码审查

## 概述
结构化代码审查流程，按优先级检查安全、正确性、性能、规范。

## 路由
| 场景 | 操作 |
|------|------|
| 提交前自查 | 读取 [pre-commit-checklist.md](references/pre-commit-checklist.md) |
| PR 审查 | 读取 [pr-review-checklist.md](references/pr-review-checklist.md) |
| 安全审查 | 读取 [security-checklist.md](references/security-checklist.md) |
| 性能审查 | 读取 [performance-checklist.md](references/performance-checklist.md) |

## 审查优先级

**P0 - 必须修复（阻塞合并）：**
- 安全漏洞（SQL 注入、XSS、密钥泄露）
- 数据丢失风险（无事务、无错误处理）
- 崩溃 bug（未捕获异常、空指针）

**P1 - 应该修复：**
- 性能问题（N+1 查询、内存泄漏、无分页）
- 逻辑错误（边界条件、竞态条件）
- 类型安全问题（as any、未校验输入）

**P2 - 建议修复：**
- 代码风格不一致
- 命名不清晰
- 缺少测试
- 冗余代码

## 快速自查命令

```bash
# 提交前执行
pnpm lint && pnpm typecheck && pnpm test

# 查看本次改动
git diff --stat
git diff
```

## 文件
| 文件 | 内容 |
|------|------|
| [pre-commit-checklist.md](references/pre-commit-checklist.md) | 提交前自查清单 |
| [pr-review-checklist.md](references/pr-review-checklist.md) | PR 审查完整清单 |
| [security-checklist.md](references/security-checklist.md) | 安全专项检查 |
| [performance-checklist.md](references/performance-checklist.md) | 性能专项检查 |
