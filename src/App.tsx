import { useEffect, useState } from 'react';
import { useFeedStore } from './store/feed-store';
import { Layout } from './components/layout/Layout';
import { FileDropZone } from './components/file-io/FileDropZone';
import { Dashboard } from './components/dashboard/Dashboard';
import { ItemTable } from './components/item-list/ItemTable';
import { ItemEditor } from './components/item-editor/ItemEditor';
import { DecibelMeter } from './components/decibel/DecibelMeter';

function App() {
  const fileName = useFeedStore((s) => s.fileName);
  const view = useFeedStore((s) => s.view);
  const isDirty = useFeedStore((s) => s.isDirty);
  const selectedItemId = useFeedStore((s) => s.selectedItemId);

  const [page, setPage] = useState(() => {
    return window.location.hash === '#/decibel' ? 'decibel' : 'main';
  });

  useEffect(() => {
    const onHash = () => {
      setPage(window.location.hash === '#/decibel' ? 'decibel' : 'main');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  if (page === 'decibel') {
    return <DecibelMeter />;
  }

  const isLoaded = fileName !== null;

  return (
    <Layout>
      {!isLoaded ? (
        <FileDropZone />
      ) : view === 'dashboard' ? (
        <Dashboard />
      ) : (
        <ItemTable />
      )}

      {selectedItemId && <ItemEditor />}
    </Layout>
  );
}

export default App;
