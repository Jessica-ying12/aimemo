import { Link } from 'react-router-dom';
import type { Conversation } from '../../../shared/types';
import dayjs from 'dayjs';

const sourceLabels: Record<string, string> = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
  cursor: 'Cursor',
  kiro: 'Kiro',
  trea: 'Trea',
  manual: '手动导入',
};

interface Props {
  conversation: Conversation;
}

export function ConversationCard({ conversation }: Props) {
  const messageCount = conversation.rawContent.length;
  const preview = conversation.rawContent[0]?.content.slice(0, 100) || '';

  return (
    <Link
      to={`/conversation/${conversation.id}`}
      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-white truncate">
          {conversation.title || '未命名对话'}
        </h3>
        <span className="text-xs text-gray-400">
          {dayjs(conversation.createdAt).format('MM-DD HH:mm')}
        </span>
      </div>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{preview}</p>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
          {sourceLabels[conversation.source] || conversation.source}
        </span>
        <span className="text-xs text-gray-400">{messageCount} 条消息</span>
      </div>
    </Link>
  );
}
