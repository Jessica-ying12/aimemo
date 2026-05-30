# 新模块标准模式

## 添加一个新的后端服务模块

以"导出服务"为例，标准步骤：

### 1. 创建服务文件

```
electron/services/exporter/
├── index.ts          # 统一导出
├── markdown.ts       # Markdown 导出
├── html.ts           # HTML 导出
└── pdf.ts            # PDF 导出
```

### 2. 定义接口

```typescript
// electron/services/exporter/index.ts
export interface ExportOptions {
  format: 'markdown' | 'html' | 'pdf';
  noteIds: string[];
  outputDir?: string;
}

export { exportToMarkdown } from './markdown';
export { exportToHTML } from './html';
export { exportToPDF } from './pdf';
```

### 3. 注册 IPC

在 `shared/ipc-channels.ts` 追加：
```typescript
EXPORT_MARKDOWN: 'export:markdown',
EXPORT_HTML: 'export:html',
EXPORT_PDF: 'export:pdf',
```

在 `electron/ipc-handlers.ts` 追加：
```typescript
registerHandler(IPC_CHANNELS.EXPORT_MARKDOWN, (noteId: string) => {
  if (!noteId) throw new Error('Invalid noteId');
  return exportToMarkdown(noteId);
});
```

在 `src/lib/api.ts` 追加：
```typescript
export: {
  markdown: (noteId: string) => invoke<string>('export:markdown', noteId),
},
```

### 4. 写测试

```typescript
// tests/unit/exporter/markdown.test.ts
describe('exportToMarkdown', () => {
  it('should generate valid markdown with frontmatter', () => { ... });
  it('should handle notes without category', () => { ... });
});
```

---

## 添加一个新的前端页面

### 1. 创建页面组件

```
src/pages/NewFeaturePage.tsx
```

### 2. 如果需要状态管理

```
src/stores/newFeatureStore.ts
```

### 3. 注册路由

在 `src/App.tsx` 的 Routes 中添加：
```typescript
<Route path="new-feature" element={<NewFeaturePage />} />
```

### 4. 添加侧边栏入口

在 `src/components/layout/Sidebar.tsx` 的 navItems 中添加。

---

## 添加一个新的采集器

### 1. 创建解析器

```
electron/services/collector/parsers/new-tool.ts
```

继承 `BaseCollector`，实现：
- `discoverFiles()` — 找到对话文件
- `parseFile()` — 解析单个文件
- `getDefaultPaths()` — 默认监控路径

### 2. 注册

在 `electron/services/collector/setup.ts` 中注册。

### 3. 更新检测器

在 `electron/services/collector/detector.ts` 中添加检测逻辑。

---

## 添加一个新的数据库表

### 1. 添加迁移

在 `electron/services/database/migrations/index.ts` 的 `migrations` 数组末尾追加新迁移对象，version 递增。

### 2. 创建 CRUD 文件

```
electron/services/database/new-entity.ts
```

### 3. 注册 IPC

同上。

### 4. 更新 shared/types.ts

添加新实体的 TypeScript 类型定义。
