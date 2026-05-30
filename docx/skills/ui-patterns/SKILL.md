---
name: ui-patterns
description: "AIMemo UI 开发模式。当需要处理错误展示、加载状态、状态管理、通用 UI 交互模式时使用。包含 Toast/Modal/Loading 规范、Zustand store 模式、表单处理。"
version: 1.0.0
---

# AIMemo UI 开发模式

## 概述
定义前端 UI 的标准交互模式，确保用户体验一致。

## 路由
| 场景 | 操作 |
|------|------|
| 错误展示 | 读取 [error-ux.md](references/error-ux.md) |
| 状态管理 | 读取 [store-patterns.md](references/store-patterns.md) |
| 通用 UI 模式 | 读取 [common-patterns.md](references/common-patterns.md) |

## 快速参考

### 错误展示规则

| 错误类型 | 展示方式 | 示例 |
|---------|---------|------|
| 操作失败（可重试） | Toast 通知 | "保存失败，请重试" |
| 表单校验 | 字段下方 inline | "标题不能为空" |
| 页面级错误 | 全屏错误页 + 重试按钮 | "加载失败" |
| 致命错误 | ErrorBoundary 兜底页 | "应用出错，请重启" |
| 确认操作 | Modal 对话框 | "确定删除？" |

### 加载状态规则

| 场景 | 展示方式 |
|------|---------|
| 页面首次加载 | 骨架屏或居中 Spinner |
| 列表加载更多 | 底部 Spinner |
| 按钮操作中 | 按钮 disabled + 文字变"处理中..." |
| 后台任务 | 状态栏小图标 |

### Zustand Store 规则

- 每个页面/功能域一个 store（不要一个全局大 store）
- Store 命名：`use{Domain}Store`
- 异步操作放在 store action 中，不放组件里
- 不在 store 中存可以从其他 store 派生的数据

## 文件
| 文件 | 内容 |
|------|------|
| [error-ux.md](references/error-ux.md) | 错误展示详细规范 |
| [store-patterns.md](references/store-patterns.md) | Zustand store 模式 |
| [common-patterns.md](references/common-patterns.md) | 通用 UI 模式 |
