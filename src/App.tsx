import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ConversationListPage } from './pages/ConversationListPage';
import { ConversationDetailPage } from './pages/ConversationDetailPage';
import { ImportPage } from './pages/ImportPage';
import { SearchPage } from './pages/SearchPage';
import { CollectorStatusPage } from './pages/CollectorStatusPage';
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
          <Route path="conversation/:id" element={<ConversationDetailPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="collector" element={<CollectorStatusPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
