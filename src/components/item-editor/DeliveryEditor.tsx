import type { Delivery } from '../../types/heureka';
import { DELIVERY_METHODS } from '../../data/delivery-methods';

interface DeliveryEditorProps {
  deliveries: Delivery[];
  onChange: (deliveries: Delivery[]) => void;
}

export function DeliveryEditor({ deliveries, onChange }: DeliveryEditorProps) {
  const updateDelivery = (index: number, updates: Partial<Delivery>) => {
    const updated = deliveries.map((d, i) =>
      i === index ? { ...d, ...updates } : d
    );
    onChange(updated);
  };

  const addDelivery = () => {
    onChange([...deliveries, { deliveryId: '', deliveryPrice: 0 }]);
  };

  const removeDelivery = (index: number) => {
    onChange(deliveries.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Doprava</label>
        <button
          type="button"
          onClick={addDelivery}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          + Přidat dopravu
        </button>
      </div>
      {deliveries.length === 0 && (
        <p className="text-sm text-gray-400">Žádné způsoby dopravy</p>
      )}
      {deliveries.map((delivery, i) => (
        <div key={i} className="flex flex-wrap gap-2 items-start bg-gray-50 p-2 rounded">
          <select
            value={
              DELIVERY_METHODS.some((m) => m.id === delivery.deliveryId)
                ? delivery.deliveryId
                : '__custom'
            }
            onChange={(e) => {
              if (e.target.value === '__custom') return;
              updateDelivery(i, { deliveryId: e.target.value });
            }}
            className="flex-1 min-w-[140px] px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
          >
            <option value="">Vyberte dopravce...</option>
            {DELIVERY_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
            <option value="__custom">Jiný...</option>
          </select>
          {!DELIVERY_METHODS.some((m) => m.id === delivery.deliveryId) && (
            <input
              type="text"
              value={delivery.deliveryId}
              onChange={(e) => updateDelivery(i, { deliveryId: e.target.value })}
              placeholder="ID dopravce"
              className="flex-1 min-w-[120px] px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          )}
          <input
            type="number"
            value={delivery.deliveryPrice}
            onChange={(e) =>
              updateDelivery(i, { deliveryPrice: parseFloat(e.target.value) || 0 })
            }
            placeholder="Cena"
            className="w-full sm:w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <input
            type="number"
            value={delivery.deliveryPriceCod ?? ''}
            onChange={(e) =>
              updateDelivery(i, {
                deliveryPriceCod: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            placeholder="Dobírka"
            className="w-full sm:w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={() => removeDelivery(i)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Odebrat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
