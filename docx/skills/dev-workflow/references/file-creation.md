# 文件创建规范

## 创建文件前必须确认

1. **位置正确** — 参照下方目录映射表
2. **命名正确** — 参照命名规范
3. **不重复** — 先搜索是否已有类似文件
4. **有导出** — 新文件必须在对应 index.ts 中导出（如果有的话）

## 目录映射

```
需求类型              → 文件位置
─────────────────────────────────────────────
新页面               → src/pages/XxxPage.tsx
页面内子组件          → src/components/{模块}/Xxx.tsx
全局通用组件          → src/components/common/Xxx.tsx
布局组件             → src/components/layout/Xxx.tsx
状态管理             → src/stores/xxxStore.ts
自定义 Hook          → src/hooks/useXxx.ts
工具函数             → src/lib/xxx.ts
后端服务             → electron/services/{模块}/xxx.ts
数据库表操作          → electron/services/database/xxx.ts
数据库迁移           → electron/services/database/migrations/index.ts (追加)
IPC 接口             → electron/ipc-handlers.ts (追加)
共享类型             → shared/types.ts (追加) 或 shared/xxx.ts (新文件)
IPC 通道常量         → shared/ipc-channels.ts (追加)
测试                → tests/unit/{模块}/xxx.test.ts
```

## 新建 React 组件模板

```typescript
// src/components/{module}/ComponentName.tsx
interface Props {
  // 明确定义所有 props
}

export function ComponentName({ ...props }: Props) {
  return (
    <div>
      {/* 实现 */}
    </div>
  );
}
```

## 新建主进程服务模板

```typescript
// electron/services/{module}/service-name.ts
import { logger } from '../logger';

export function doSomething(param: string): Result {
  logger.debug('module', `Doing something with ${param}`);
  // 实现
}
```

## 新建数据库操作模板

```typescript
// electron/services/database/entity-name.ts
import { getDatabase } from './index';
import { v4 as uuid } from 'uuid';

export const entityDB = {
  list(): Entity[] {
    const db = getDatabase();
    // 使用参数化查询，禁止字符串拼接
    return db.prepare('SELECT * FROM entity ORDER BY created_at DESC').all() as Entity[];
  },

  create(input: CreateInput): Entity {
    const db = getDatabase();
    const id = uuid();
    const now = new Date().toISOString();

    const transaction = db.transaction(() => {
      db.prepare('INSERT INTO entity (...) VALUES (...)').run(...);
      // FTS 更新也在事务内
    });
    transaction();

    return this.get(id)!;
  },
};
```

## 新建 IPC 接口

在 `electron/ipc-handlers.ts` 中追加：

```typescript
registerHandler('entity:action', (param) => {
  // 1. 校验输入
  const validated = validate(schema, param);
  // 2. 调用服务
  return entityDB.action(validated);
});
```

同时在 `shared/ipc-channels.ts` 中追加通道常量。
在 `src/lib/api.ts` 中追加前端调用方法。

## 禁止事项

- 不要创建 `utils.ts` 万能工具文件，按功能拆分
- 不要在 `src/` 中直接 import `electron/` 下的模块
- 不要创建空文件占位
- 不要在组件文件中写业务逻辑超过 20 行（提取到 hook 或 store）
