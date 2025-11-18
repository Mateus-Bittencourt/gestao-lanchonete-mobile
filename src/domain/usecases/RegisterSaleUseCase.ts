import { Sale } from '../models/Sale';
import { SalesRepository } from '../repositories/SalesRepository';
import { InventoryRepository } from '../repositories/InventoryRepository';

export class RegisterSaleUseCase {
  constructor(
    private salesRepo: SalesRepository,
    private inventoryRepo: InventoryRepository
  ) {}

  async execute(sale: Sale): Promise<void> {
    await this.salesRepo.registerSale(sale);
    for (const item of sale.items) {
      await this.inventoryRepo.adjustStock(item.productId, -item.quantity);
    }
  }
}