import { create } from 'zustand';
import type { ShopItem, Delivery, ValidationError, ViewMode, FilterStatus } from '../types/heureka';
import { parseXml } from '../lib/xml-parser';
import { serializeXml } from '../lib/xml-serializer';
import { validateFeed } from '../lib/validator';
import { createEmptyItem } from '../lib/utils';

interface FeedStore {
  // Data
  items: ShopItem[];
  validationErrors: ValidationError[];
  fileName: string | null;
  isDirty: boolean;
  parseErrors: string[];

  // UI state
  view: ViewMode;
  selectedItemId: string | null;
  searchQuery: string;
  filterStatus: FilterStatus;

  // Actions
  loadFromXml: (xmlString: string, fileName: string) => void;
  createNewFeed: () => void;
  addItem: (item?: ShopItem) => void;
  updateItem: (itemId: string, updates: Partial<ShopItem>) => void;
  deleteItem: (itemId: string) => void;
  duplicateItem: (itemId: string) => void;
  selectItem: (itemId: string | null) => void;
  setView: (view: ViewMode) => void;
  setSearch: (query: string) => void;
  setFilter: (filter: FilterStatus) => void;
  bulkSetDelivery: (delivery: Delivery, mode: 'add' | 'replace') => void;
  exportXml: () => string;
  revalidate: () => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  items: [],
  validationErrors: [],
  fileName: null,
  isDirty: false,
  parseErrors: [],

  view: 'dashboard',
  selectedItemId: null,
  searchQuery: '',
  filterStatus: 'all',

  loadFromXml: (xmlString, fileName) => {
    const result = parseXml(xmlString);
    const validation = validateFeed(result.items);
    set({
      items: result.items,
      validationErrors: validation.errors,
      fileName,
      isDirty: false,
      parseErrors: result.parseErrors,
      view: result.parseErrors.length > 0 ? 'dashboard' : 'list',
      selectedItemId: null,
    });
  },

  createNewFeed: () => {
    set({
      items: [],
      validationErrors: [],
      fileName: 'heureka-feed.xml',
      isDirty: false,
      parseErrors: [],
      view: 'list',
      selectedItemId: null,
    });
  },

  addItem: (item) => {
    const newItem = item ?? createEmptyItem();
    const items = [...get().items, newItem];
    const validation = validateFeed(items);
    set({
      items,
      validationErrors: validation.errors,
      isDirty: true,
      selectedItemId: newItem.itemId,
    });
  },

  updateItem: (itemId, updates) => {
    const items = get().items.map((item) =>
      item.itemId === itemId ? { ...item, ...updates } : item
    );
    const validation = validateFeed(items);
    set({ items, validationErrors: validation.errors, isDirty: true });
  },

  deleteItem: (itemId) => {
    const items = get().items.filter((item) => item.itemId !== itemId);
    const validation = validateFeed(items);
    set({
      items,
      validationErrors: validation.errors,
      isDirty: true,
      selectedItemId: get().selectedItemId === itemId ? null : get().selectedItemId,
    });
  },

  duplicateItem: (itemId) => {
    const original = get().items.find((item) => item.itemId === itemId);
    if (!original) return;
    const duplicate: ShopItem = {
      ...original,
      itemId: createEmptyItem().itemId,
      productName: original.productName + ' (kopie)',
    };
    const items = [...get().items, duplicate];
    const validation = validateFeed(items);
    set({
      items,
      validationErrors: validation.errors,
      isDirty: true,
      selectedItemId: duplicate.itemId,
    });
  },

  selectItem: (itemId) => set({ selectedItemId: itemId }),

  setView: (view) => set({ view }),

  setSearch: (query) => set({ searchQuery: query }),

  setFilter: (filter) => set({ filterStatus: filter }),

  bulkSetDelivery: (delivery, mode) => {
    const items = get().items.map((item) => ({
      ...item,
      deliveries:
        mode === 'replace'
          ? [delivery]
          : [...item.deliveries, delivery],
    }));
    const validation = validateFeed(items);
    set({ items, validationErrors: validation.errors, isDirty: true });
  },

  exportXml: () => serializeXml(get().items),

  revalidate: () => {
    const validation = validateFeed(get().items);
    set({ validationErrors: validation.errors });
  },
}));

// Selectors
export function useFilteredItems() {
  const items = useFeedStore((s) => s.items);
  const search = useFeedStore((s) => s.searchQuery);
  const filter = useFeedStore((s) => s.filterStatus);
  const errors = useFeedStore((s) => s.validationErrors);

  return items.filter((item) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matches =
        item.productName.toLowerCase().includes(q) ||
        item.itemId.toLowerCase().includes(q) ||
        item.categoryText.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Status filter
    if (filter === 'valid') {
      return !errors.some((e) => e.itemId === item.itemId && e.severity === 'error');
    }
    if (filter === 'invalid') {
      return errors.some((e) => e.itemId === item.itemId && e.severity === 'error');
    }

    return true;
  });
}
