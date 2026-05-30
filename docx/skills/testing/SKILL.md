---
name: testing
description: "AIMemo 项目测试规范。当需要写测试、运行测试、检查测试覆盖率时使用。包含测试模式、mock 策略、测试命名规范。每次写新功能需要配套测试时调用。"
version: 1.0.0
---

# AIMemo 测试规范

## 概述
使用 vitest 作为测试框架。测试分为单元测试和集成测试。

## 路由
| 场景 | 操作 |
|------|------|
| 写单元测试 | 读取 [unit-test-patterns.md](references/unit-test-patterns.md) |
| Mock 外部服务 | 读取 [mock-strategies.md](references/mock-strategies.md) |
| 测试数据库操作 | 读取 [database-testing.md](references/database-testing.md) |

## 快速参考

### 运行测试

```bash
pnpm test              # 运行所有测试
pnpm test:watch        # 监听模式
pnpm test:coverage     # 覆盖率报告
pnpm test -- --grep "pattern"  # 运行匹配的测试
```

### 测试文件位置

```
tests/
├── unit/
│   ├── database/       # 数据库 CRUD 测试
│   ├── collector/      # 采集器解析测试
│   ├── processor/      # AI 处理测试（mock AI）
│   ├── exporter/       # 导出功能测试
│   └── embedding/      # 向量相关测试
├── integration/
│   ├── ipc.test.ts     # IPC 通信测试
│   └── pipeline.test.ts # 采集→处理 流水线测试
├── helpers/
│   ├── test-db.ts      # 测试数据库工具
│   ├── fixtures.ts     # 测试数据工厂
│   └── mocks.ts        # 通用 mock
└── setup.ts            # 全局测试设置
```

### 覆盖率要求

| 模块 | 最低覆盖率 |
|------|-----------|
| database/ | 90% |
| collector/parsers/ | 80% |
| processor/ | 70% |
| exporter/ | 80% |
| embedding/ | 70% |

### 测试命名

```typescript
describe('模块名', () => {
  describe('方法名', () => {
    it('should 做什么 when 什么条件', () => { ... });
  });
});
```

## 文件
| 文件 | 内容 |
|------|------|
| [unit-test-patterns.md](references/unit-test-patterns.md) | 单元测试模式 |
| [mock-strategies.md](references/mock-strategies.md) | Mock 策略 |
| [database-testing.md](references/database-testing.md) | 数据库测试方法 |
