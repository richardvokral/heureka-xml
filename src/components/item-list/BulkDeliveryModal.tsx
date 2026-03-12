import { useState } from 'react';
import { DELIVERY_METHODS } from '../../data/delivery-methods';
import { useFeedStore } from '../../store/feed-store';

interface BulkDeliveryModalProps {
  onClose: () => void;
}

export function BulkDeliveryModal({ onClose }: BulkDeliveryModalProps) {
  const bulkSetDelivery = useFeedStore((s) => s.bulkSetDelivery);
  const itemCount = useFeedStore((s) => s.items.length);

  const [deliveryId, setDeliveryId] = useState('');
  const [customId, setCustomId] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('0');
  const [deliveryPriceCod, setDeliveryPriceCod] = useState('');
  const [mode, setMode] = useState<'add' | 'replace'>('add');

  const isCustom = deliveryId === '__custom';
  const effectiveId = isCustom ? customId : deliveryId;
  const canApply = effectiveId.trim() !== '' && itemCount > 0;

  const handleApply = () => {
    if (!canApply) return;
    bulkSetDelivery(
      {
        deliveryId: effectiveId,
        deliveryPrice: parseFloat(deliveryPrice) || 0,
        deliveryPriceCod: deliveryPriceCod ? parseFloat(deliveryPriceCod) : undefined,
      },
      mode
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Hromadná úprava doručení
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Nastavte dopravu pro všech {itemCount} položek najednou.
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Delivery method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Způsob dopravy
            </label>
            <select
              value={deliveryId}
              onChange={(e) => setDeliveryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
            >
              <option value="">Vyberte dopravce...</option>
              {DELIVERY_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
              <option value="__custom">Jiný...</option>
            </select>
            {isCustom && (
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="ID dopravce"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            )}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cena dopravy (Kč)
              </label>
              <input
                type="number"
                value={deliveryPrice}
                onChange={(e) => setDeliveryPrice(e.target.value)}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dobírka (Kč)
              </label>
              <input
                type="number"
                value={deliveryPriceCod}
                onChange={(e) => setDeliveryPriceCod(e.target.value)}
                min="0"
                step="1"
                placeholder="Nepovinné"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Režim
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="add"
                  checked={mode === 'add'}
                  onChange={() => setMode('add')}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Přidat ke všem</strong> — přidá jako další způsob dopravy
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="replace"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <strong>Nahradit u všech</strong> — odstraní stávající dopravy a nahradí touto
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
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
