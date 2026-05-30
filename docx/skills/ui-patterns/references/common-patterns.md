# 通用 UI 模式

## 加载状态

### 页面首次加载

```typescript
function ConversationListPage() {
  const { conversations, loading, error, fetch } = useConversationStore();

  useEffect(() => { fetch(); }, [fetch]);

  if (loading && conversations.length === 0) {
    return <PageSkeleton />;  // 骨架屏
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetch} />;
  }

  if (conversations.length === 0) {
    return <EmptyState message="暂无对话" action={{ label: '导入', to: '/import' }} />;
  }

  return <ConversationList items={conversations} />;
}
```

### 按钮操作中

```typescript
function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await onDelete();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? '删除中...' : '删除'}
    </button>
  );
}
```

## 空状态

每个列表页都必须有空状态，包含：
- 说明文字
- 引导操作（按钮或链接）

```typescript
// src/components/common/EmptyState.tsx
interface EmptyStateProps {
  message: string;
  action?: { label: string; to: string } | { label: string; onClick: () => void };
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-gray-400">{message}</p>
      {action && (
        // 渲染按钮或链接
      )}
    </div>
  );
}
```

## 列表模式

### 标准列表页结构

```
┌─────────────────────────────────────┐
│ 标题                    操作按钮     │  ← Header
├─────────────────────────────────────┤
│ [筛选] [排序] [搜索框]              │  ← FilterBar
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 列表项 1                        │ │  ← List
│ ├─────────────────────────────────┤ │
│ │ 列表项 2                        │ │
│ ├─────────────────────────────────┤ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 共 N 条  [上一页] 1/5 [下一页]     │  ← Pagination
└─────────────────────────────────────┘
```

### 分页 vs 无限滚动

- 数据量 < 100：不分页，一次加载
- 数据量 100-1000：分页（每页 20 条）
- 数据量 > 1000：虚拟滚动（@tanstack/react-virtual）

## 表单模式

```typescript
function CreateNoteForm() {
  const [form, setForm] = useState({ title: '', content: '', category: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = '标题不能为空';
    if (form.title.length > 100) newErrors.title = '标题不能超过 100 字';
    if (!form.content.trim()) newErrors.content = '内容不能为空';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.notes.create(form);
      show('success', '创建成功');
      navigate('/notes');
    } catch (error: any) {
      show('error', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd+K` | 全局搜索 |
| `Cmd+N` | 新建/导入 |
| `Cmd+,` | 打开设置 |
| `Escape` | 关闭 Modal/返回 |

## 深色模式

所有颜色使用 Tailwind 的 `dark:` 变体：

```typescript
// 好
className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"

// 坏：硬编码颜色
className="bg-white text-black"
```

## 响应式

窗口最小宽度 900px，不需要移动端适配。但要处理：
- 侧边栏折叠（窗口 < 1100px 时自动折叠）
- 内容区域自适应宽度
- 长文本截断（`truncate` 或 `line-clamp-2`）
