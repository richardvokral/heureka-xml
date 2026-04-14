import { useFeedStore } from '../../store/feed-store';
import { downloadXml } from '../../lib/xml-serializer';
import type { ViewMode } from '../../types/heureka';

export function Header() {
  const view = useFeedStore((s) => s.view);
  const setView = useFeedStore((s) => s.setView);
  const items = useFeedStore((s) => s.items);
  const fileName = useFeedStore((s) => s.fileName);
  const isDirty = useFeedStore((s) => s.isDirty);
  const validationErrors = useFeedStore((s) => s.validationErrors);
  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;

  const isLoaded = fileName !== null;

  const handleExport = () => {
    if (errorCount > 0 && !window.confirm(`Feed obsahuje ${errorCount} chyb. Přesto stáhnout?`)) {
      return;
    }
    downloadXml(items, fileName ?? 'heureka-feed.xml');
  };

  const tabs: { key: ViewMode; label: string }[] = [
    { key: 'dashboard', label: 'Přehled' },
    { key: 'list', label: 'Položky' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 sm:h-16 sm:py-0">
          <div className="flex items-center gap-2 sm:gap-6">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Heureka XML Editor
            </h1>
            {isLoaded && (
              <nav className="flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setView(tab.key)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      view === tab.key
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#/decibel"
              className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
            >
              Měřič dB
            </a>
            {isLoaded && (
              <>
                <span className="text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">
                  {fileName}
                  {isDirty && <span className="text-orange-500 ml-1">*</span>}
                </span>
                <button
                  onClick={handleExport}
                  className="px-3 sm:px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Stáhnout XML
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
