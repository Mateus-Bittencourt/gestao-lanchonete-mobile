import { Sale } from '../models/Sale';

export interface SalesRepository {
  registerSale(sale: Sale): Promise<void>;
  list(): Promise<Sale[]>;
  getWeeklyTotal(): Promise<number>;
}