import type { ShopItem, Param, Delivery } from '../types/heureka';

function getText(el: Element, tagName: string): string | null {
  const child = el.querySelector(tagName);
  if (!child) return null;
  const text = child.textContent?.trim() ?? '';
  return text || null;
}

function getNumber(el: Element, tagName: string): number | undefined {
  const text = getText(el, tagName);
  if (text === null) return undefined;
  const num = parseFloat(text);
  return isNaN(num) ? undefined : num;
}

function parseParams(el: Element): Param[] {
  const params: Param[] = [];
  const paramEls = el.querySelectorAll(':scope > PARAM');
  for (const p of paramEls) {
    const paramName = getText(p, 'PARAM_NAME') ?? '';
    const val = getText(p, 'VAL') ?? '';
    if (paramName || val) {
      params.push({ paramName, val });
    }
  }
  return params;
}

function parseDeliveries(el: Element): Delivery[] {
  const deliveries: Delivery[] = [];
  const deliveryEls = el.querySelectorAll(':scope > DELIVERY');
  for (const d of deliveryEls) {
    const deliveryId = getText(d, 'DELIVERY_ID') ?? '';
    const deliveryPrice = getNumber(d, 'DELIVERY_PRICE') ?? 0;
    const deliveryPriceCod = getNumber(d, 'DELIVERY_PRICE_COD');
    if (deliveryId) {
      deliveries.push({ deliveryId, deliveryPrice, deliveryPriceCod });
    }
  }
  return deliveries;
}

function parseShopItem(el: Element, index: number): ShopItem {
  const imgUrlAlternative: string[] = [];
  const altImgs = el.querySelectorAll(':scope > IMGURL_ALTERNATIVE');
  for (const img of altImgs) {
    const url = img.textContent?.trim();
    if (url) imgUrlAlternative.push(url);
  }

  return {
    itemId: getText(el, 'ITEM_ID') ?? `auto_${index}`,
    productName: getText(el, 'PRODUCTNAME') ?? getText(el, 'PRODUCT') ?? '',
    url: getText(el, 'URL') ?? '',
    priceVat: getNumber(el, 'PRICE_VAT') ?? 0,
    categoryText: getText(el, 'CATEGORYTEXT') ?? '',
    description: getText(el, 'DESCRIPTION') ?? '',
    imgUrl: getText(el, 'IMGURL') ?? '',
    deliveryDate: getNumber(el, 'DELIVERY_DATE') ?? 0,
    manufacturer: getText(el, 'MANUFACTURER') ?? undefined,
    ean: getText(el, 'EAN') ?? undefined,
    isbn: getText(el, 'ISBN') ?? undefined,
    itemType: parseItemType(getText(el, 'ITEM_TYPE')),
    price: getNumber(el, 'PRICE'),
    vat: getNumber(el, 'VAT'),
    imgUrlAlternative,
    params: parseParams(el),
    deliveries: parseDeliveries(el),
  };
}

function parseItemType(val: string | null): 'new' | 'bazaar' | undefined {
  if (val === 'new' || val === 'bazaar') return val;
  return undefined;
}

export interface ParseResult {
  items: ShopItem[];
  parseErrors: string[];
}

export function parseXml(xmlString: string): ParseResult {
  // Strip BOM
  const cleaned = xmlString.replace(/^\uFEFF/, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'application/xml');

  const parseErrors: string[] = [];

  // Check for parse errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    parseErrors.push('Chyba parsování XML: ' + (parserError.textContent ?? 'Neznámá chyba'));
    return { items: [], parseErrors };
  }

  const shopItems = doc.querySelectorAll('SHOPITEM');
  if (shopItems.length === 0) {
    parseErrors.push('Nenalezeny žádné elementy SHOPITEM v XML souboru.');
    return { items: [], parseErrors };
  }

  const items: ShopItem[] = [];
  shopItems.forEach((el, index) => {
    items.push(parseShopItem(el, index));
  });

  return { items, parseErrors };
}
