import { InventoryRepository } from '../../domain/repositories/InventoryRepository';
import { Product } from '../../domain/models/Product';
import { LocalDatabase } from '../local/LocalDatabase';
import { LOW_STOCK_THRESHOLD_PERCENT } from '../../core/constants';
import { firestore, isFirebaseAvailable } from '../../core/firebase/config';

const COLLECTION = 'products';

export class InventoryRepositoryImpl implements InventoryRepository {
  async getAll(): Promise<Product[]> {
    if (isFirebaseAvailable()) {
      const db = firestore();
      if (db) {
        const snap = await db.collection(COLLECTION).get();
        const list: Product[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        await LocalDatabase.saveProducts(list);
        return list;
      }
    }
    return LocalDatabase.getProducts();
  }

  async get(id: string): Promise<Product | undefined> {
    const all = await this.getAll();
    return all.find(p => p.id === id);
  }

  async save(product: Product): Promise<void> {
    const all = await LocalDatabase.getProducts();
    const idx = all.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      all[idx] = product;
    } else {
      all.push(product);
    }
    await LocalDatabase.saveProducts(all);

    if (isFirebaseAvailable()) {
      const db = firestore();
      if (db) await db.collection(COLLECTION).doc(product.id).set(product, { merge: true });
    }
  }

  async adjustStock(productId: string, delta: number): Promise<void> {
    const all = await LocalDatabase.getProducts();
    const target = all.find(p => p.id === productId);
    if (!target) return;
    target.currentQuantity = Math.max(0, target.currentQuantity + delta);
    await LocalDatabase.saveProducts(all);

    if (isFirebaseAvailable()) {
      const db = firestore();
      if (db) await db.collection(COLLECTION).doc(productId).set({ currentQuantity: target.currentQuantity }, { merge: true });
    }
  }

  async getLowStock(): Promise<Product[]> {
    const all = await this.getAll();
    return all.filter(p => p.currentQuantity <= p.minQuantity * (1 + LOW_STOCK_THRESHOLD_PERCENT));
  }
}