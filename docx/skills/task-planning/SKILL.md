---
name: task-planning
description: "AIMemo 需求拆解与方案规划。当需要规划新功能、拆解需求为可执行 commit、验证方案可行性时使用。包含从需求到可执行任务文件的完整流程，以及方案审查和修正规范。"
version: 1.0.0
---

# AIMemo 需求拆解与方案规划

## 概述
将一个功能需求从构思到拆解为可逐个执行的 commit 方案的完整工作流。

## 路由
| 场景 | 操作 |
|------|------|
| 写新功能方案 | 读取 [planning-workflow.md](references/planning-workflow.md) |
| 拆解为 commit | 读取 [commit-splitting.md](references/commit-splitting.md) |
| 审查方案可行性 | 读取 [feasibility-review.md](references/feasibility-review.md) |
| 修正不可行方案 | 读取 [fix-plan.md](references/fix-plan.md) |
| 任务文件模板 | 读取 [task-file-template.md](references/task-file-template.md) |

## 快速流程

```
需求想法
  ↓
Step 1: 写方案概要（目标、范围、技术选型）
  ↓
Step 2: 拆解为最小 commit 列表
  ↓
Step 3: 可行性审查（依赖、冲突、风险）
  ↓
Step 4: 修正问题，确认可执行
  ↓
Step 5: 生成任务文件（每个 commit 一个 md）
  ↓
开始开发
```

## 核心原则

1. **每个 commit 后项目可运行** — 不允许半成品状态
2. **每个 commit 只做一件事** — 不混合功能和重构
3. **前置依赖明确** — 每个任务标注依赖哪些前置任务
4. **可验证** — 每个任务有明确的验证方式
5. **代码完整** — 任务文件中的代码片段可直接复制使用

## 文件
| 文件 | 内容 |
|------|------|
| [planning-workflow.md](references/planning-workflow.md) | 方案规划完整流程 |
| [commit-splitting.md](references/commit-splitting.md) | commit 拆分规则 |
| [feasibility-review.md](references/feasibility-review.md) | 可行性审查清单 |
| [fix-plan.md](references/fix-plan.md) | 方案修正流程 |
| [task-file-template.md](references/task-file-template.md) | 任务文件标准模板 |
