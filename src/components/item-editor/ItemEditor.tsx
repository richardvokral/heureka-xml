import { useState, useEffect } from 'react';
import { useFeedStore } from '../../store/feed-store';
import type { ShopItem } from '../../types/heureka';
import { ParamEditor } from './ParamEditor';
import { DeliveryEditor } from './DeliveryEditor';
import { ImageUrlEditor } from './ImageUrlEditor';
import { FieldError } from '../validation/FieldError';

export function ItemEditor() {
  const selectedItemId = useFeedStore((s) => s.selectedItemId);
  const items = useFeedStore((s) => s.items);
  const updateItem = useFeedStore((s) => s.updateItem);
  const selectItem = useFeedStore((s) => s.selectItem);

  const originalItem = items.find((i) => i.itemId === selectedItemId);

  const [form, setForm] = useState<ShopItem | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (originalItem) {
      setForm({ ...originalItem });
    } else {
      setForm(null);
    }
  }, [selectedItemId]);

  if (!form || !selectedItemId) return null;

  const updateField = <K extends keyof ShopItem>(field: K, value: ShopItem[K]) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = () => {
    if (!form) return;
    // If itemId was changed, we need to handle that
    if (form.itemId !== selectedItemId) {
      // Delete old, add new
      const store = useFeedStore.getState();
      const newItems = store.items.map((item) =>
        item.itemId === selectedItemId ? form : item
      );
      // Directly update via store manipulation
      useFeedStore.setState({
        items: newItems,
        isDirty: true,
        selectedItemId: form.itemId,
      });
      useFeedStore.getState().revalidate();
    } else {
      updateItem(selectedItemId, form);
    }
  };

  const handleClose = () => {
    selectItem(null);
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upravit položku</h2>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Uložit
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Required fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Povinné údaje
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ITEM_ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.itemId}
                onChange={(e) => updateField('itemId', e.target.value)}
                className={inputClass}
                maxLength={36}
              />
              <FieldError itemId={selectedItemId} field="itemId" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PRODUCTNAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => updateField('productName', e.target.value)}
                className={inputClass}
                placeholder="Název produktu"
              />
              <FieldError itemId={selectedItemId} field="productName" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => updateField('url', e.target.value)}
                className={inputClass}
                placeholder="https://example.com/produkt"
              />
              <FieldError itemId={selectedItemId} field="url" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PRICE_VAT <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.priceVat || ''}
                  onChange={(e) =>
                    updateField('priceVat', parseFloat(e.target.value) || 0)
                  }
                  className={inputClass}
                  placeholder="Cena s DPH"
                  step="0.01"
                  min="0"
                />
                <FieldError itemId={selectedItemId} field="priceVat" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DELIVERY_DATE <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.deliveryDate}
                  onChange={(e) =>
                    updateField('deliveryDate', parseInt(e.target.value) || 0)
                  }
                  className={inputClass}
                  placeholder="Počet dnů"
                  min="0"
                />
                <FieldError itemId={selectedItemId} field="deliveryDate" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CATEGORYTEXT <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.categoryText}
                onChange={(e) => updateField('categoryText', e.target.value)}
                className={inputClass}
                placeholder="Heureka.cz | Kategorie | Podkategorie"
              />
              <FieldError itemId={selectedItemId} field="categoryText" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DESCRIPTION <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={inputClass + ' min-h-[80px]'}
                placeholder="Popis produktu"
                rows={3}
              />
              <FieldError itemId={selectedItemId} field="description" />
            </div>

            <ImageUrlEditor
              imgUrl={form.imgUrl}
              imgUrlAlternative={form.imgUrlAlternative}
              onImgUrlChange={(url) => updateField('imgUrl', url)}
              onAlternativesChange={(urls) => updateField('imgUrlAlternative', urls)}
            />
            <FieldError itemId={selectedItemId} field="imgUrl" />
          </div>

          {/* Optional fields */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Volitelné údaje
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MANUFACTURER
                  </label>
                  <input
                    type="text"
                    value={form.manufacturer ?? ''}
                    onChange={(e) =>
                      updateField('manufacturer', e.target.value || undefined)
                    }
                    className={inputClass}
                    placeholder="Výrobce"
                  />
                  <FieldError itemId={selectedItemId} field="manufacturer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      EAN
                    </label>
                    <input
                      type="text"
                      value={form.ean ?? ''}
                      onChange={(e) =>
                        updateField('ean', e.target.value || undefined)
                      }
                      className={inputClass}
                      placeholder="Čárový kód"
                    />
                    <FieldError itemId={selectedItemId} field="ean" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={form.isbn ?? ''}
                      onChange={(e) =>
                        updateField('isbn', e.target.value || undefined)
                      }
                      className={inputClass}
                      placeholder="ISBN"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ITEM_TYPE
                    </label>
                    <select
                      value={form.itemType ?? ''}
                      onChange={(e) =>
                        updateField(
                          'itemType',
                          (e.target.value as 'new' | 'bazaar') || undefined
                        )
                      }
                      className={inputClass + ' bg-white'}
                    >
                      <option value="">—</option>
                      <option value="new">new</option>
                      <option value="bazaar">bazaar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PRICE (bez DPH)
                    </label>
                    <input
                      type="number"
                      value={form.price ?? ''}
                      onChange={(e) =>
                        updateField(
                          'price',
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className={inputClass}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT (%)
                    </label>
                    <input
                      type="number"
                      value={form.vat ?? ''}
                      onChange={(e) =>
                        updateField(
                          'vat',
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className={inputClass}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Params */}
          <div className="border-t border-gray-200 pt-4">
            <ParamEditor
              params={form.params}
              onChange={(params) => updateField('params', params)}
            />
          </div>

          {/* Deliveries */}
          <div className="border-t border-gray-200 pt-4">
            <DeliveryEditor
              deliveries={form.deliveries}
              onChange={(deliveries) => updateField('deliveries', deliveries)}
            />
          </div>

          {/* Bottom save button */}
          <div className="border-t border-gray-200 pt-4 flex gap-2 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Uložit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
