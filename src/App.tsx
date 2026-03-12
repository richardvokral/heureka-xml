import { useEffect } from 'react';
import { useFeedStore } from './store/feed-store';
import { Layout } from './components/layout/Layout';
import { FileDropZone } from './components/file-io/FileDropZone';
import { Dashboard } from './components/dashboard/Dashboard';
import { ItemTable } from './components/item-list/ItemTable';
import { ItemEditor } from './components/item-editor/ItemEditor';

function App() {
  const fileName = useFeedStore((s) => s.fileName);
  const view = useFeedStore((s) => s.view);
  const isDirty = useFeedStore((s) => s.isDirty);
  const selectedItemId = useFeedStore((s) => s.selectedItemId);

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
