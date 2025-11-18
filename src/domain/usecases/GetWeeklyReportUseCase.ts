import { SalesRepository } from '../repositories/SalesRepository';
import { InventoryRepository } from '../repositories/InventoryRepository';
import { WEEKLY_REPORT_DAYS } from '../../core/constants';

export interface WeeklyProductSummary {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface WeeklyReportResult {
  totalRevenue: number;
  products: WeeklyProductSummary[];
}

export class GetWeeklyReportUseCase {
  constructor(
    private salesRepo: SalesRepository,
    private inventoryRepo: InventoryRepository
  ) {}

  async execute(): Promise<WeeklyReportResult> {
    const sales = await this.salesRepo.list();
    const products = await this.inventoryRepo.getAll();

    const now = Date.now();
    const msWeek = WEEKLY_REPORT_DAYS * 24 * 60 * 60 * 1000;
    const map = new Map<string, WeeklyProductSummary>();

    for (const s of sales) {
      if (now - s.timestamp > msWeek) continue;
      for (const it of s.items) {
        const prod = products.find(p => p.id === it.productId);
        const name = prod?.name ?? it.productId;
        const prev = map.get(it.productId) ?? { productId: it.productId, name, quantitySold: 0, revenue: 0 };
        prev.quantitySold += it.quantity;
        prev.revenue += it.quantity * it.unitPrice;
        map.set(it.productId, prev);
      }
    }

    const list = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = list.reduce((acc, x) => acc + x.revenue, 0);
    return { totalRevenue, products: list };
  }
}
