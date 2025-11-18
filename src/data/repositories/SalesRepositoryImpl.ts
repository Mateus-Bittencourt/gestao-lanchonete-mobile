import { SalesRepository } from '../../domain/repositories/SalesRepository';
import { Sale } from '../../domain/models/Sale';
import { LocalDatabase } from '../local/LocalDatabase';
import { WEEKLY_REPORT_DAYS } from '../../core/constants';

export class SalesRepositoryImpl implements SalesRepository {
  async registerSale(sale: Sale): Promise<void> {
    const all = await LocalDatabase.getSales();
    all.push(sale);
    await LocalDatabase.saveSales(all);
  }

  async list(): Promise<Sale[]> {
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