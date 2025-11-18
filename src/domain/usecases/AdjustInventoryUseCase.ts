import { InventoryRepository } from '../repositories/InventoryRepository';

export class AdjustInventoryUseCase {
  constructor(private inventoryRepo: InventoryRepository) {}

  // reason is kept for future audit logging
  async execute(productId: string, delta: number, _reason?: string): Promise<void> {
    await this.inventoryRepo.adjustStock(productId, delta);
  }
}
