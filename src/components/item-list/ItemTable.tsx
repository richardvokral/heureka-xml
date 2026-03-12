import { useState } from 'react';
import { useFeedStore, useFilteredItems } from '../../store/feed-store';
import { SearchBar } from './SearchBar';
import { ItemRow } from './ItemRow';
import { BulkDeliveryModal } from './BulkDeliveryModal';

export function ItemTable() {
  const addItem = useFeedStore((s) => s.addItem);
  const totalItems = useFeedStore((s) => s.items.length);
  const filteredItems = useFilteredItems();
  const [showBulkDelivery, setShowBulkDelivery] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Položky ({totalItems})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkDelivery(true)}
            disabled={totalItems === 0}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Hromadná doprava
          </button>
          <button
            onClick={() => addItem()}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            + Přidat položku
          </button>
        </div>
      </div>

      {showBulkDelivery && (
        <BulkDeliveryModal onClose={() => setShowBulkDelivery(false)} />
      )}

      <SearchBar />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {totalItems === 0
              ? 'Feed neobsahuje žádné položky. Přidejte první položku.'
              : 'Žádné položky neodpovídají filtru.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">
                  Stav
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Název
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cena s DPH
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kategorie
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <ItemRow key={item.itemId} item={item} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
