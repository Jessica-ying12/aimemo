import { useAppStore } from '../stores/appStore';

export function SettingsPage() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">设置</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">外观</h2>
        <div className="mt-3 flex gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                theme === t
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {{ light: '浅色', dark: '深色', system: '跟随系统' }[t]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
