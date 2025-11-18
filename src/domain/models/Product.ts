export interface Product {
  id: string;
  name: string;
  unit: string;              // ex.: 'un', 'kg'
  currentQuantity: number;
  minQuantity: number;
  price: number;
  active: boolean;
}