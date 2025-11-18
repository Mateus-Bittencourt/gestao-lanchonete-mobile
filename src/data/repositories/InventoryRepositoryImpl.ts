import { InventoryRepository } from '../../domain/repositories/InventoryRepository';
import { Product } from '../../domain/models/Product';
import { LocalDatabase } from '../local/LocalDatabase';
import { LOW_STOCK_THRESHOLD_PERCENT } from '../../core/constants';

export class InventoryRepositoryImpl implements InventoryRepository {
  async getAll(): Promise<Product[]> {
    return LocalDatabase.getProducts();
  }

  async get(id: string): Promise<Product | undefined> {
    const all = await this.getAll();
    return all.find(p => p.id === id);
  }

  async save(product: Product): Promise<void> {
    const all = await this.getAll();
    const idx = all.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      all[idx] = product;
    } else {
      all.push(product);
    }
    await LocalDatabase.saveProducts(all);
  }

  async adjustStock(productId: string, delta: number): Promise<void> {
    const all = await this.getAll();
    const target = all.find(p => p.id === productId);
    if (!target) return;
    target.currentQuantity = Math.max(0, target.currentQuantity + delta);
    await LocalDatabase.saveProducts(all);
  }

  async getLowStock(): Promise<Product[]> {
    const all = await this.getAll();
    return all.filter(p => p.currentQuantity <= p.minQuantity * (1 + LOW_STOCK_THRESHOLD_PERCENT));
  }
}