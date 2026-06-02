import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface SourceStatus {
  source: string;
  name: string;
  enabled: boolean;
  watching: boolean;
  todayCount: number;
}

export function CollectorStatusPage() {
  const [status, setStatus] = useState<string>('stopped');
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [scanning, setScanning] = useState(false);

  async function refresh() {
    const [s, src] = await Promise.all([api.collector.status(), api.collector.sources()]);
    setStatus(s);
    setSources(src);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleFullScan() {
    setScanning(true);
    try {
      await api.collector.fullScan();
      refresh();
    } finally {
      setScanning(false);
    }
  }

  async function handleToggle() {
    if (status === 'running') {
      await api.collector.pause();
    } else {
      await api.collector.start();
    }
    refresh();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">采集状态</h1>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            status === 'running'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {status === 'running' ? '运行中' : status === 'paused' ? '已暂停' : '已停止'}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {sources.map((source) => (
          <div
            key={source.source}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full ${
                  source.watching
                    ? 'bg-green-500'
                    : source.enabled
                      ? 'bg-yellow-500'
                      : 'bg-gray-300'
                }`}
              />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{source.name}</p>
                <p className="text-xs text-gray-400">
                  {source.watching ? '监控中' : source.enabled ? '已启用' : '未检测到'}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">今日 +{source.todayCount}</span>
          </div>
        ))}

        {sources.length === 0 && (
          <p className="text-gray-400 text-center py-8">未检测到已安装的 AI 工具</p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleFullScan}
          disabled={scanning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {scanning ? '扫描中...' : '全量扫描'}
        </button>
        <button
          onClick={handleToggle}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {status === 'running' ? '暂停采集' : '恢复采集'}
        </button>
      </div>
    </div>
  );
}
