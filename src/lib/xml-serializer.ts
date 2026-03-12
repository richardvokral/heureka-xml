import type { ShopItem } from '../types/heureka';
import { escapeXml } from './utils';

function tag(name: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  return `    <${name}>${escapeXml(String(value))}</${name}>\n`;
}

function cdataTag(name: string, value: string | undefined | null): string {
  if (!value) return '';
  return `    <${name}><![CDATA[${value}]]></${name}>\n`;
}

function serializeItem(item: ShopItem): string {
  let xml = '  <SHOPITEM>\n';

  // Required fields
  xml += tag('ITEM_ID', item.itemId);
  xml += tag('PRODUCTNAME', item.productName);
  xml += tag('URL', item.url);
  xml += tag('PRICE_VAT', item.priceVat);
  xml += tag('CATEGORYTEXT', item.categoryText);
  xml += cdataTag('DESCRIPTION', item.description);
  xml += tag('IMGURL', item.imgUrl);
  xml += tag('DELIVERY_DATE', item.deliveryDate);

  // Optional fields
  xml += tag('MANUFACTURER', item.manufacturer);
  xml += tag('EAN', item.ean);
  xml += tag('ISBN', item.isbn);
  xml += tag('ITEM_TYPE', item.itemType);
  if (item.price !== undefined && item.price > 0) {
    xml += tag('PRICE', item.price);
  }
  if (item.vat !== undefined) {
    xml += tag('VAT', item.vat);
  }

  // Alternative images
  for (const altImg of item.imgUrlAlternative) {
    xml += tag('IMGURL_ALTERNATIVE', altImg);
  }

  // Params
  for (const param of item.params) {
    xml += '    <PARAM>\n';
    xml += `      <PARAM_NAME>${escapeXml(param.paramName)}</PARAM_NAME>\n`;
    xml += `      <VAL>${escapeXml(param.val)}</VAL>\n`;
    xml += '    </PARAM>\n';
  }

  // Deliveries
  for (const delivery of item.deliveries) {
    xml += '    <DELIVERY>\n';
    xml += `      <DELIVERY_ID>${escapeXml(delivery.deliveryId)}</DELIVERY_ID>\n`;
    xml += `      <DELIVERY_PRICE>${delivery.deliveryPrice}</DELIVERY_PRICE>\n`;
    if (delivery.deliveryPriceCod !== undefined) {
      xml += `      <DELIVERY_PRICE_COD>${delivery.deliveryPriceCod}</DELIVERY_PRICE_COD>\n`;
    }
    xml += '    </DELIVERY>\n';
  }

  xml += '  </SHOPITEM>\n';
  return xml;
}

export function serializeXml(items: ShopItem[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<SHOP>\n';
  for (const item of items) {
    xml += serializeItem(item);
  }
  xml += '</SHOP>\n';
  return xml;
}

export function downloadXml(items: ShopItem[], fileName: string = 'heureka-feed.xml'): void {
  const xmlString = serializeXml(items);
  const blob = new Blob([xmlString], { type: 'application/xml; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
