import { SalesRepository } from '../../domain/repositories/SalesRepository';
import { Sale } from '../../domain/models/Sale';
import { LocalDatabase } from '../local/LocalDatabase';
import { WEEKLY_REPORT_DAYS } from '../../core/constants';
import { firestore, isFirebaseAvailable } from '../../core/firebase/config';

const COLLECTION = 'sales';

export class SalesRepositoryImpl implements SalesRepository {
  async registerSale(sale: Sale): Promise<void> {
    const all = await LocalDatabase.getSales();
    all.push(sale);
    await LocalDatabase.saveSales(all);

    if (isFirebaseAvailable()) {
      const db = firestore();
      if (db) await db.collection(COLLECTION).doc(sale.id).set(sale, { merge: true });
    }
  }

  async list(): Promise<Sale[]> {
    if (isFirebaseAvailable()) {
      const db = firestore();
      if (db) {
        const snap = await db.collection(COLLECTION).get();
        const list: Sale[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        await LocalDatabase.saveSales(list);
        return list;
      }
    }
    return LocalDatabase.getSales();
  }

  async getWeeklyTotal(): Promise<number> {
    const all = await this.list();
    const now = Date.now();
    const msWeek = WEEKLY_REPORT_DAYS * 24 * 60 * 60 * 1000;
    return all
      .filter(s => now - s.timestamp <= msWeek)
      .reduce((acc, s) => acc + s.total, 0);
  }
}