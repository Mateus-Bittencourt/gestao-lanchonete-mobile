import { InventoryRepository } from '../repositories/InventoryRepository';
import { Product } from '../models/Product';

export class GetLowStockAlertsUseCase {
  constructor(private inventoryRepo: InventoryRepository) {}

  async execute(): Promise<Product[]> {
    return this.inventoryRepo.getLowStock();
  }
}