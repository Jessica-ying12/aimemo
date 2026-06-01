import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function ImportPage() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);

  async function handlePasteImport() {
    if (!text.trim()) return;
    setImporting(true);
    try {
      await api.import.paste(text);
      setText('');
      navigate('/');
    } finally {
      setImporting(false);
    }
  }

  async function handleFileImport() {
    setImporting(true);
    try {
      const result = await api.import.file();
      if (result) {
        navigate('/');
      }
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">导入对话</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">从文件导入</h2>
        <p className="mt-1 text-sm text-gray-500">支持 .json / .jsonl / .md / .txt 格式</p>
        <button
          onClick={handleFileImport}
          disabled={importing}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          选择文件
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">粘贴对话</h2>
        <p className="mt-1 text-sm text-gray-500">
          格式如 &quot;User: xxx&quot; / &quot;Assistant: xxx&quot;
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此粘贴对话内容..."
          className="mt-3 w-full h-64 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handlePasteImport}
          disabled={importing || !text.trim()}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          导入
        </button>
      </section>
    </div>
  );
}
