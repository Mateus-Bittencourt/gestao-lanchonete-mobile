export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  timestamp: number;  // Date.now()
  items: SaleItem[];
  total: number;
}