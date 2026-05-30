# Mock 策略

## 原则

- Mock 外部依赖（API、文件系统、Electron API）
- 不 Mock 被测模块本身的内部逻辑
- 数据库测试用内存 SQLite，不 Mock

## Mock Electron API

```typescript
// tests/setup.ts 中全局 mock
vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => `/tmp/aimemo-test/${name}`,
    whenReady: () => Promise.resolve(),
    on: vi.fn(),
    quit: vi.fn(),
  },
  ipcMain: { handle: vi.fn() },
  BrowserWindow: vi.fn(),
  Notification: vi.fn().mockImplementation(() => ({ show: vi.fn(), on: vi.fn() })),
  dialog: {
    showOpenDialog: vi.fn().mockResolvedValue({ filePaths: [], canceled: true }),
    showSaveDialog: vi.fn().mockResolvedValue({ filePath: undefined, canceled: true }),
  },
  safeStorage: {
    isEncryptionAvailable: () => true,
    encryptString: (s: string) => Buffer.from(s),
    decryptString: (b: Buffer) => b.toString(),
  },
}));
```

## Mock AI 服务

```typescript
// tests/helpers/mocks.ts
export function createMockAIService() {
  return {
    chat: vi.fn().mockResolvedValue('{"title": "Mock Title", "summary": "Mock summary"}'),
    chatStream: vi.fn().mockImplementation(async function* () {
      yield 'Mock ';
      yield 'response';
    }),
  };
}

// 使用
vi.mock('../../electron/services/ai', () => ({
  getAIService: () => createMockAIService(),
}));
```

## Mock 文件系统

```typescript
import { vol } from 'memfs';

// 对于需要文件系统的测试，使用 memfs
vi.mock('fs', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');
  return memfs.fs;
});

beforeEach(() => {
  vol.fromJSON({
    '/home/user/.claude/projects/proj1/conversations/conv1.jsonl':
      '{"type":"human","content":"hello"}\n{"type":"assistant","content":"hi"}',
  });
});

afterEach(() => {
  vol.reset();
});
```

## Mock 定时器

```typescript
it('should debounce file changes', async () => {
  vi.useFakeTimers();

  const handler = vi.fn();
  watcher.on('change', handler);

  // 模拟快速连续变化
  watcher.emit('raw-change', '/path/file.json');
  watcher.emit('raw-change', '/path/file.json');
  watcher.emit('raw-change', '/path/file.json');

  // 还没到 debounce 时间
  expect(handler).not.toHaveBeenCalled();

  // 推进时间
  vi.advanceTimersByTime(2000);
  expect(handler).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});
```

## Mock HTTP 请求（AI API）

```typescript
import { vi } from 'vitest';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'mocked response' } }],
        }),
      },
    },
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    },
  })),
}));
```

## 不要 Mock 的东西

- better-sqlite3（用 `:memory:` 数据库代替）
- 纯函数（直接测试）
- 类型定义
- 常量
