let counter = 0;

export function generateId(): string {
  counter++;
  return `item_${Date.now()}_${counter}`;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function formatPrice(price: number): string {
  return price.toLocaleString('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function createEmptyItem(): import('../types/heureka').ShopItem {
  return {
    itemId: generateId(),
    productName: '',
    url: '',
    priceVat: 0,
    categoryText: '',
    description: '',
    imgUrl: '',
    deliveryDate: 0,
    imgUrlAlternative: [],
    params: [],
    deliveries: [],
  };
}
