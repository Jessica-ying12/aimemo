import { useEffect } from 'react';
import { useConversationStore } from '../stores/conversationStore';
import { ConversationCard } from '../components/conversation/ConversationCard';

export function ConversationListPage() {
  const { conversations, total, loading, fetch } = useConversationStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">对话列表</h1>
        <span className="text-sm text-gray-400">共 {total} 条</span>
      </div>

      <div className="mt-4 space-y-3">
        {loading && <p className="text-gray-400">加载中...</p>}

        {!loading && conversations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">暂无对话</p>
            <p className="mt-1 text-sm text-gray-400">点击侧边栏&quot;导入&quot;添加对话</p>
          </div>
        )}

        {conversations.map((conv) => (
          <ConversationCard key={conv.id} conversation={conv} />
        ))}
      </div>
    </div>
  );
}
