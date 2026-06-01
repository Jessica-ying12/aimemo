import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

const navItems = [
  { path: '/', label: '对话', icon: '💬' },
  { path: '/import', label: '导入', icon: '📥' },
  { path: '/search', label: '搜索', icon: '🔍' },
  { path: '/settings', label: '设置', icon: '⚙️' },
];

export function Sidebar() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <aside
      className={`
      flex flex-col border-r border-gray-200 dark:border-gray-700
      bg-gray-50 dark:bg-gray-800 transition-all
      ${sidebarCollapsed ? 'w-16' : 'w-56'}
    `}
    >
      <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && (
          <span className="font-semibold text-gray-800 dark:text-white">AIMemo</span>
        )}
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            <span>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
