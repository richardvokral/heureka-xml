import { useFeedStore } from '../../store/feed-store';
import type { FilterStatus } from '../../types/heureka';

export function SearchBar() {
  const searchQuery = useFeedStore((s) => s.searchQuery);
  const setSearch = useFeedStore((s) => s.setSearch);
  const filterStatus = useFeedStore((s) => s.filterStatus);
  const setFilter = useFeedStore((s) => s.setFilter);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Vše' },
    { key: 'valid', label: 'Validní' },
    { key: 'invalid', label: 'S chybami' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Hledat podle názvu, ID nebo kategorie..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-2 text-sm rounded-md font-medium transition-colors ${
              filterStatus === f.key
                ? 'bg-green-100 text-green-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
