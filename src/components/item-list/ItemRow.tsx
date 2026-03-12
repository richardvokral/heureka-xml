import type { ShopItem } from '../../types/heureka';
import { useFeedStore } from '../../store/feed-store';
import { getItemErrors } from '../../lib/validator';
import { formatPrice } from '../../lib/utils';

interface ItemRowProps {
  item: ShopItem;
}

export function ItemRow({ item }: ItemRowProps) {
  const selectItem = useFeedStore((s) => s.selectItem);
  const deleteItem = useFeedStore((s) => s.deleteItem);
  const duplicateItem = useFeedStore((s) => s.duplicateItem);
  const errors = useFeedStore((s) => s.validationErrors);

  const itemErrors = getItemErrors(errors, item.itemId);
  const hasErrors = itemErrors.some((e) => e.severity === 'error');
  const hasWarnings = itemErrors.some((e) => e.severity === 'warning');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Smazat položku "${item.productName || item.itemId}"?`)) {
      deleteItem(item.itemId);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateItem(item.itemId);
  };

  return (
    <tr
      onClick={() => selectItem(item.itemId)}
      className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
    >
      <td className="px-4 py-3">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            hasErrors ? 'bg-red-500' : hasWarnings ? 'bg-yellow-400' : 'bg-green-500'
          }`}
          title={
            hasErrors
              ? `${itemErrors.filter((e) => e.severity === 'error').length} chyb`
              : hasWarnings
              ? `${itemErrors.filter((e) => e.severity === 'warning').length} upozornění`
              : 'OK'
          }
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.itemId}</td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">
          {item.productName || <span className="text-gray-400 italic">Bez názvu</span>}
        </div>
        {item.manufacturer && (
          <div className="text-xs text-gray-500">{item.manufacturer}</div>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
        {item.priceVat > 0 ? `${formatPrice(item.priceVat)} Kč` : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
        {item.categoryText || '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex gap-1 justify-end">
          <button
            onClick={handleDuplicate}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Duplikovat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Smazat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
