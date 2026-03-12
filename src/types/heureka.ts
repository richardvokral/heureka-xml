export interface Param {
  paramName: string;
  val: string;
}

export interface Delivery {
  deliveryId: string;
  deliveryPrice: number;
  deliveryPriceCod?: number;
}

export interface ShopItem {
  // Required
  itemId: string;
  productName: string;
  url: string;
  priceVat: number;
  categoryText: string;
  description: string;
  imgUrl: string;
  deliveryDate: number;

  // Optional
  manufacturer?: string;
  ean?: string;
  isbn?: string;
  itemType?: 'new' | 'bazaar';
  price?: number;
  vat?: number;

  // Repeatable
  imgUrlAlternative: string[];
  params: Param[];
  deliveries: Delivery[];
}

export interface ValidationError {
  itemId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  errors: ValidationError[];
  isValid: boolean;
}

export type ViewMode = 'dashboard' | 'list';
export type FilterStatus = 'all' | 'valid' | 'invalid';
