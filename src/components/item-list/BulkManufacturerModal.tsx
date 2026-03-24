import { useState } from 'react';
import { useFeedStore } from '../../store/feed-store';

interface BulkManufacturerModalProps {
  onClose: () => void;
}

export function BulkManufacturerModal({ onClose }: BulkManufacturerModalProps) {
  const bulkSetManufacturer = useFeedStore((s) => s.bulkSetManufacturer);
  const itemCount = useFeedStore((s) => s.items.length);

  const [manufacturer, setManufacturer] = useState('');

  const canApply = manufacturer.trim() !== '' && itemCount > 0;

  const handleApply = () => {
    if (!canApply) return;
    bulkSetManufacturer(manufacturer.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Hromadná úprava výrobce
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Nastavte výrobce pro všech {itemCount} položek najednou.
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Výrobce
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="Název výrobce"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              autoFocus
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={handleApply}
            disabled={!canApply}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Použít na všechny položky
          </button>
        </div>
      </div>
    </div>
  );
}
