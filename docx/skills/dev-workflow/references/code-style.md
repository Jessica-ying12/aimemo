# 代码风格规范

## TypeScript

- `strict: true`，不允许隐式 any
- 优先用 `interface` 定义对象类型，`type` 用于联合类型和工具类型
- 函数返回类型：简单函数可省略（TS 推断），公共 API 必须显式标注
- 禁止 `as any` 类型断言（除非有 `// SAFETY:` 注释说明原因）
- 使用 `unknown` 而非 `any` 接收外部数据

## 函数

```typescript
// 好：短小、单一职责、命名清晰
export function parseConversation(content: string): ParsedConversation | null {
  // ...
}

// 坏：过长、多职责、命名模糊
export function process(data: any): any {
  // ...
}
```

- 函数体不超过 50 行，超过则拆分
- 参数不超过 3 个，超过用对象参数
- 纯函数优先（无副作用）

## 错误处理

```typescript
// 主进程服务层：catch + log + 返回 null 或 rethrow
async function parseFile(path: string): Promise<Result | null> {
  try {
    // ...
  } catch (error: any) {
    logger.error('module', `Failed: ${error.message}`);
    return null; // 或 throw，取决于调用方是否能处理
  }
}

// IPC 层：统一由 registerHandler wrapper 处理，不需要手动 try-catch
// 渲染进程：在 api 层统一处理，组件中用 try-catch 包裹调用
```

## React 组件

```typescript
// 好：函数组件 + 具名导出
export function ConversationCard({ conversation }: Props) { ... }

// 坏：匿名默认导出
export default function({ data }: any) { ... }
```

- 组件文件只包含一个主组件（小的辅助组件可以放同文件）
- Props 接口定义在组件上方
- 状态逻辑超过 5 行提取到自定义 hook
- 事件处理函数命名：`handleXxx`（如 `handleSubmit`）

## 导入顺序

```typescript
// 1. React/框架
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 第三方库
import dayjs from 'dayjs';

// 3. 项目内部（绝对路径）
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';
import type { Conversation } from '../../shared/types';

// 4. 相对路径（同模块）
import { MessageBubble } from './MessageBubble';
```

## 注释

- 默认不写注释
- 只在以下情况写：
  - WHY（为什么这样做，不是做了什么）
  - HACK/WORKAROUND（临时方案，附带 issue 链接）
  - SAFETY（为什么 type assertion 是安全的）
- 禁止 `// TODO` 没有 issue 编号的

## 异步

- 一律 async/await
- 并行操作用 `Promise.all()`
- 不用 `.then().catch()` 链
- 长时间操作要有超时：

```typescript
const result = await Promise.race([
  longOperation(),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000)),
]);
```
