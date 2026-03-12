import { useFeedStore } from '../../store/feed-store';
import { ValidationSummary } from '../validation/ValidationSummary';
import { formatPrice } from '../../lib/utils';

export function Dashboard() {
  const items = useFeedStore((s) => s.items);
  const errors = useFeedStore((s) => s.validationErrors);
  const parseErrors = useFeedStore((s) => s.parseErrors);

  const errorItems = new Set(
    errors.filter((e) => e.severity === 'error').map((e) => e.itemId)
  );
  const validCount = items.filter((i) => !errorItems.has(i.itemId)).length;
  const invalidCount = items.length - validCount;

  const prices = items.map((i) => i.priceVat).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const categories = new Set(items.map((i) => i.categoryText).filter(Boolean));

  const stats = [
    { label: 'Celkem položek', value: items.length, color: 'text-gray-900' },
    { label: 'Validních', value: validCount, color: 'text-green-600' },
    { label: 'S chybami', value: invalidCount, color: 'text-red-600' },
    { label: 'Kategorií', value: categories.size, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Chyby parsování</h3>
          {parseErrors.map((err, i) => (
            <p key={i} className="text-sm text-red-700">{err}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {prices.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Cenové rozpětí (s DPH)</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(minPrice)} Kč — {formatPrice(maxPrice)} Kč
          </p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Validace</h2>
        <ValidationSummary />
      </div>
    </div>
  );
}
