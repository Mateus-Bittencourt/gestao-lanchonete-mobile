import { Product } from '../models/Product';

export interface InventoryRepository {
  getAll(): Promise<Product[]>;
  get(id: string): Promise<Product | undefined>;
  save(product: Product): Promise<void>;
  adjustStock(productId: string, delta: number): Promise<void>;
  getLowStock(): Promise<Product[]>;
}