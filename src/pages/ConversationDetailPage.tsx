import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Conversation } from '../../shared/types';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.conversations.get(id).then((data) => {
      setConversation(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-400">加载中...</div>;
  }

  if (!conversation) {
    return <div className="p-6 text-gray-400">对话不存在</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← 返回
        </button>
        <div className="flex-1">
          <h1 className="font-medium text-gray-800 dark:text-white">
            {conversation.title || '未命名对话'}
          </h1>
          <p className="text-xs text-gray-400">
            {conversation.source} · {dayjs(conversation.createdAt).format('YYYY-MM-DD HH:mm')} ·{' '}
            {conversation.rawContent.length} 条消息
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {conversation.rawContent.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`relative group max-w-[80%] px-4 py-3 rounded-2xl ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div
                  className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'dark:prose-invert'}`}
                >
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-xs bg-black/10 hover:bg-black/20 transition-opacity"
                >
                  复制
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
