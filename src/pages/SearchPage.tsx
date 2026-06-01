import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Conversation } from '../../shared/types';
import dayjs from 'dayjs';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Conversation[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const data = await api.conversations.search(query.trim());
      setResults(data);
    } finally {
      setSearching(false);
    }
  }, [query]);

  function handleKeyDown(e: { key: string }) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">搜索</h1>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索对话内容..."
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          搜索
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {searching && <p className="text-gray-400">搜索中...</p>}

        {!searching && searched && results.length === 0 && (
          <p className="text-gray-400">未找到匹配的对话</p>
        )}

        {results.map((conv) => (
          <Link
            key={conv.id}
            to={`/conversation/${conv.id}`}
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800 dark:text-white">
                {conv.title || '未命名对话'}
              </h3>
              <span className="text-xs text-gray-400">
                {dayjs(conv.createdAt).format('MM-DD HH:mm')}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {conv.rawContent[0]?.content.slice(0, 150)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
