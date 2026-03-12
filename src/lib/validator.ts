import type { ShopItem, ValidationError, ValidationResult } from '../types/heureka';

const URL_REGEX = /^https?:\/\/.+/;
const ITEM_ID_REGEX = /^[a-zA-Z0-9_-]{1,36}$/;
const EAN_REGEX = /^\d{8}$|^\d{13}$/;

function validateItem(item: ShopItem): ValidationError[] {
  const errors: ValidationError[] = [];
  const id = item.itemId;

  function err(field: string, message: string, severity: 'error' | 'warning' = 'error') {
    errors.push({ itemId: id, field, message, severity });
  }

  // Required fields
  if (!item.itemId) {
    err('itemId', 'ITEM_ID je povinný.');
  } else if (!ITEM_ID_REGEX.test(item.itemId)) {
    err('itemId', 'ITEM_ID smí obsahovat pouze a-z, A-Z, 0-9, _ a - (max 36 znaků).');
  }

  if (!item.productName) {
    err('productName', 'PRODUCTNAME je povinný.');
  }

  if (!item.url) {
    err('url', 'URL je povinná.');
  } else {
    if (!URL_REGEX.test(item.url)) {
      err('url', 'URL musí začínat http:// nebo https://.');
    }
    if (item.url.length > 300) {
      err('url', 'URL nesmí být delší než 300 znaků.');
    }
  }

  if (!item.priceVat || item.priceVat <= 0) {
    err('priceVat', 'PRICE_VAT musí být kladné číslo.');
  }

  if (!item.categoryText) {
    err('categoryText', 'CATEGORYTEXT je povinný.');
  } else if (!item.categoryText.includes('|')) {
    err('categoryText', 'CATEGORYTEXT by měl obsahovat oddělovač "|" pro kategorie.', 'warning');
  }

  if (!item.description) {
    err('description', 'DESCRIPTION je povinný.');
  }

  if (!item.imgUrl) {
    err('imgUrl', 'IMGURL je povinný.');
  } else {
    if (!URL_REGEX.test(item.imgUrl)) {
      err('imgUrl', 'IMGURL musí začínat http:// nebo https://.');
    }
    if (item.imgUrl.length > 255) {
      err('imgUrl', 'IMGURL nesmí být delší než 255 znaků.');
    }
    if (/\s/.test(item.imgUrl)) {
      err('imgUrl', 'IMGURL nesmí obsahovat mezery.');
    }
  }

  if (item.deliveryDate < 0) {
    err('deliveryDate', 'DELIVERY_DATE musí být 0 nebo kladné číslo.');
  }

  // Optional field validation
  if (item.ean && !EAN_REGEX.test(item.ean)) {
    err('ean', 'EAN musí mít 8 nebo 13 číslic.');
  }

  if (item.price !== undefined && item.price < 0) {
    err('price', 'PRICE musí být kladné číslo.');
  }

  if (item.vat !== undefined && (item.vat < 0 || item.vat > 100)) {
    err('vat', 'VAT musí být mezi 0 a 100.');
  }

  if (!item.manufacturer) {
    err('manufacturer', 'MANUFACTURER je doporučený.', 'warning');
  }

  // Params validation
  item.params.forEach((param, i) => {
    if (!param.paramName) {
      err(`params[${i}].paramName`, 'PARAM_NAME nesmí být prázdný.');
    }
    if (!param.val) {
      err(`params[${i}].val`, 'VAL nesmí být prázdný.');
    }
  });

  // Deliveries validation
  item.deliveries.forEach((d, i) => {
    if (!d.deliveryId) {
      err(`deliveries[${i}].deliveryId`, 'DELIVERY_ID nesmí být prázdný.');
    }
    if (d.deliveryPrice < 0) {
      err(`deliveries[${i}].deliveryPrice`, 'DELIVERY_PRICE musí být nezáporná.');
    }
  });

  // Alt images
  item.imgUrlAlternative.forEach((url, i) => {
    if (url && !URL_REGEX.test(url)) {
      err(`imgUrlAlternative[${i}]`, 'IMGURL_ALTERNATIVE musí začínat http:// nebo https://.');
    }
  });

  return errors;
}

export function validateFeed(items: ShopItem[]): ValidationResult {
  const errors: ValidationError[] = [];

  // Per-item validation
  for (const item of items) {
    errors.push(...validateItem(item));
  }

  // Cross-item: duplicate ITEM_ID
  const idCounts = new Map<string, number>();
  for (const item of items) {
    idCounts.set(item.itemId, (idCounts.get(item.itemId) ?? 0) + 1);
  }
  for (const item of items) {
    if ((idCounts.get(item.itemId) ?? 0) > 1) {
      errors.push({
        itemId: item.itemId,
        field: 'itemId',
        message: `Duplicitní ITEM_ID: "${item.itemId}".`,
        severity: 'error',
      });
    }
  }

  // Cross-item: duplicate URL
  const urlCounts = new Map<string, number>();
  for (const item of items) {
    if (item.url) {
      urlCounts.set(item.url, (urlCounts.get(item.url) ?? 0) + 1);
    }
  }
  for (const item of items) {
    if (item.url && (urlCounts.get(item.url) ?? 0) > 1) {
      errors.push({
        itemId: item.itemId,
        field: 'url',
        message: `Duplicitní URL: "${item.url}".`,
        severity: 'warning',
      });
    }
  }

  return {
    errors,
    isValid: errors.filter((e) => e.severity === 'error').length === 0,
  };
}

export function getItemErrors(errors: ValidationError[], itemId: string): ValidationError[] {
  return errors.filter((e) => e.itemId === itemId);
}

export function getFieldErrors(errors: ValidationError[], itemId: string, field: string): ValidationError[] {
  return errors.filter((e) => e.itemId === itemId && e.field === field);
}
