import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ConversationListPage } from './pages/ConversationListPage';
import { ImportPage } from './pages/ImportPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAppStore } from './stores/appStore';

function App() {
  const initTheme = useAppStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ConversationListPage />} />
          <Route path="conversation/:id" element={<div>对话详情</div>} />
          <Route path="import" element={<ImportPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
