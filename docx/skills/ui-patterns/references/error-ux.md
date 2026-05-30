# 错误展示规范

## Toast 通知

用于：操作反馈（成功/失败），不阻塞用户操作。

```typescript
// src/components/common/Toast.tsx
import { create } from 'zustand';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (type: ToastItem['type'], message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (type, message) => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// 使用
const { show } = useToastStore();
try {
  await api.notes.delete(id);
  show('success', '删除成功');
} catch (error: any) {
  show('error', error.message || '操作失败');
}
```

**规则：**
- 成功消息 3 秒自动消失
- 错误消息 5 秒自动消失（或手动关闭）
- 同时最多显示 3 条
- 位置：右上角

## 确认对话框

用于：不可逆操作（删除、归档、覆盖）。

```typescript
// src/components/common/ConfirmModal.tsx
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;    // 默认 "确认"
  cancelText?: string;     // 默认 "取消"
  danger?: boolean;        // true 时确认按钮为红色
  onConfirm: () => void;
  onCancel: () => void;
}

// 使用
<ConfirmModal
  open={showDelete}
  title="删除对话"
  message="删除后无法恢复，确定要删除吗？"
  danger
  confirmText="删除"
  onConfirm={handleDelete}
  onCancel={() => setShowDelete(false)}
/>
```

**规则：**
- 删除操作必须有确认
- 确认文案要明确说明后果
- 危险操作用红色按钮
- 支持 ESC 关闭

## 表单校验错误

用于：用户输入不合法。

```typescript
// 字段级错误展示
<div>
  <input
    className={`border ${error ? 'border-red-500' : 'border-gray-200'}`}
    value={value}
    onChange={onChange}
  />
  {error && (
    <p className="mt-1 text-sm text-red-500">{error}</p>
  )}
</div>
```

**规则：**
- 实时校验（onChange 或 onBlur）
- 错误文案具体（"标题不能超过 100 字" 而非 "输入无效"）
- 提交时再次校验所有字段
- 第一个错误字段自动聚焦

## 页面级错误

用于：数据加载失败、页面不存在。

```typescript
// src/components/common/ErrorState.tsx
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 px-4 py-2 ...">
          重试
        </button>
      )}
    </div>
  );
}
```

## ErrorBoundary

用于：未捕获的渲染错误，防止整个应用白屏。

```typescript
// 包裹每个页面路由
<ErrorBoundary fallback={<CrashPage />}>
  <Route ... />
</ErrorBoundary>
```

## 错误文案规范

| 场景 | 好的文案 | 坏的文案 |
|------|---------|---------|
| 网络错误 | "网络连接失败，请检查网络后重试" | "Error: ECONNREFUSED" |
| API 限流 | "请求过于频繁，请稍后再试" | "429 Too Many Requests" |
| 数据不存在 | "对话不存在或已被删除" | "null reference" |
| 权限不足 | "无法访问该文件，请检查权限" | "EACCES" |
