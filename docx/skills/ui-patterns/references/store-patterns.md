# Zustand Store 模式

## 何时创建新 Store

| 情况 | 做法 |
|------|------|
| 页面级状态（列表数据、筛选条件） | 创建 `use{Page}Store` |
| 全局状态（主题、用户偏好） | 放 `useAppStore` |
| 跨页面共享数据（当前对话详情） | 创建独立 store |
| 组件内部状态（表单输入、展开/折叠） | 用 `useState`，不建 store |

## Store 标准结构

```typescript
// src/stores/conversationStore.ts
import { create } from 'zustand';
import { api } from '../lib/api';
import type { Conversation, ListParams, PaginatedResult } from '../../shared/types';

interface ConversationState {
  // 数据
  conversations: Conversation[];
  total: number;
  loading: boolean;
  error: string | null;

  // 筛选/分页
  filter: { source?: string; status?: string };
  page: number;

  // Actions
  fetch: (params?: ListParams) => Promise<void>;
  setFilter: (filter: Partial<ConversationState['filter']>) => void;
  reset: () => void;
}

const initialState = {
  conversations: [],
  total: 0,
  loading: false,
  error: null,
  filter: {},
  page: 1,
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  ...initialState,

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await api.conversations.list({
        page: get().page,
        ...get().filter,
        ...params,
      });
      set({
        conversations: result.items,
        total: result.total,
        page: result.page,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setFilter: (filter) => {
    set((s) => ({ filter: { ...s.filter, ...filter }, page: 1 }));
    get().fetch();
  },

  reset: () => set(initialState),
}));
```

## 规则

### 命名
- Store 文件：`src/stores/{domain}Store.ts`
- Hook 名：`use{Domain}Store`
- Action 命名：动词开头（`fetch`, `create`, `update`, `delete`, `set{Field}`, `reset`）

### 异步操作
- 异步操作放在 store action 中
- 设置 `loading` 和 `error` 状态
- 组件中只调用 action，不直接调用 api

```typescript
// 好：组件调用 store action
function MyPage() {
  const { conversations, loading, fetch } = useConversationStore();
  useEffect(() => { fetch(); }, [fetch]);
}

// 坏：组件直接调用 api
function MyPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.conversations.list().then(setData);
  }, []);
}
```

### 选择器（避免不必要重渲染）

```typescript
// 好：只订阅需要的字段
const conversations = useConversationStore((s) => s.conversations);
const loading = useConversationStore((s) => s.loading);

// 坏：订阅整个 store（任何字段变化都重渲染）
const store = useConversationStore();
```

### 派生数据

不在 store 中存储可以计算得到的数据：

```typescript
// 坏：在 store 中存 filteredConversations
// 好：在组件中用 useMemo 计算
const filteredConversations = useMemo(
  () => conversations.filter(c => c.source === selectedSource),
  [conversations, selectedSource]
);
```

### Store 之间不互相引用

如果需要跨 store 数据，在组件层组合：

```typescript
function MyComponent() {
  const conversations = useConversationStore((s) => s.conversations);
  const tags = useTagStore((s) => s.tags);
  // 在组件中组合
}
```

## 已有 Store 列表

| Store | 职责 |
|-------|------|
| `useAppStore` | 主题、侧边栏状态、全局偏好 |
| `useConversationStore` | 对话列表、筛选、分页 |
| `useNoteStore` | 笔记列表、筛选、分页 |
| `useToastStore` | Toast 通知队列 |
