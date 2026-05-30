# 单元测试模式

## 基本结构

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => {
    // 每个测试前的设置
  });

  afterEach(() => {
    // 清理
    vi.restoreAllMocks();
  });

  describe('methodName', () => {
    it('should return parsed messages for valid JSONL', () => {
      const input = '{"type":"human","content":"hello"}\n{"type":"assistant","content":"hi"}';
      const result = parseFile(input);
      expect(result).not.toBeNull();
      expect(result!.messages).toHaveLength(2);
      expect(result!.messages[0].role).toBe('user');
    });

    it('should return null for empty input', () => {
      const result = parseFile('');
      expect(result).toBeNull();
    });

    it('should handle malformed JSON gracefully', () => {
      const result = parseFile('not json\n{"valid":"json"}');
      // 应跳过无效行，不抛异常
      expect(result).not.toBeNull();
    });
  });
});
```

## 测试分类

### 1. Happy Path（正常流程）
每个功能至少一个正常流程测试。

### 2. Edge Cases（边界条件）
- 空输入
- 超长输入
- 特殊字符
- 并发调用

### 3. Error Cases（错误情况）
- 无效参数
- 外部服务失败
- 文件不存在
- 权限不足

## 断言模式

```typescript
// 值相等
expect(result).toBe(expected);
expect(result).toEqual({ key: 'value' });

// 类型检查
expect(result).toBeNull();
expect(result).toBeDefined();
expect(result).toBeInstanceOf(Error);

// 数组
expect(arr).toHaveLength(3);
expect(arr).toContain(item);

// 异步
await expect(asyncFn()).resolves.toBe(value);
await expect(asyncFn()).rejects.toThrow('message');

// 函数调用
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(1);
```

## 测试数据

使用工厂函数创建测试数据，不硬编码：

```typescript
// tests/helpers/fixtures.ts
export function createTestConversation(overrides?: Partial<Conversation>): Conversation {
  return {
    id: 'test-' + Math.random().toString(36).slice(2),
    source: 'manual',
    title: 'Test Conversation',
    rawContent: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    importedAt: '2026-01-01T00:00:00Z',
    status: 'pending',
    ...overrides,
  };
}
```

## 异步测试

```typescript
it('should process conversation asynchronously', async () => {
  const result = await processConversation(testConv);
  expect(result.title).toBeDefined();
});

it('should timeout after 30s', async () => {
  vi.useFakeTimers();
  const promise = longRunningTask();
  vi.advanceTimersByTime(31000);
  await expect(promise).rejects.toThrow('Timeout');
  vi.useRealTimers();
});
```
