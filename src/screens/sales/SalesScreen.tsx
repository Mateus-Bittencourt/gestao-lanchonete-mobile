import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { Product } from '../../domain/models/Product';
import { InventoryRepositoryImpl } from '../../data/repositories/InventoryRepositoryImpl';
import { SalesRepositoryImpl } from '../../data/repositories/SalesRepositoryImpl';
import { RegisterSaleUseCase } from '../../domain/usecases/RegisterSaleUseCase';
import { Sale, SaleItem } from '../../domain/models/Sale';

const inventoryRepo = new InventoryRepositoryImpl();
const salesRepo = new SalesRepositoryImpl();
const registerSaleUC = new RegisterSaleUseCase(salesRepo, inventoryRepo);

const SalesScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);

  async function load() {
    const p = await inventoryRepo.getAll();
    setProducts(p);
    const wt = await salesRepo.getWeeklyTotal();
    setWeeklyTotal(wt);
  }

  useEffect(() => {
    load();
  }, []);

  async function createMockSale(product: Product) {
    if (product.currentQuantity <= 0) {
      Alert.alert('Estoque insuficiente', 'Não há quantidade disponível.');
      return;
    }
    const sale: Sale = {
      id: 'S-' + Date.now(),
      timestamp: Date.now(),
      items: [
        {
          productId: product.id,
          quantity: 1,
          unitPrice: product.price
        } as SaleItem
      ],
      total: product.price
    };
    await registerSaleUC.execute(sale);
    await load();
  }

  async function seedProducts() {
    if ((await inventoryRepo.getAll()).length > 0) return;
    const seed: Product[] = [
      { id: 'P1', name: 'Hambúrguer', unit: 'un', currentQuantity: 20, minQuantity: 5, price: 15, active: true },
      { id: 'P2', name: 'Refrigerante Lata', unit: 'un', currentQuantity: 30, minQuantity: 10, price: 6, active: true },
      { id: 'P3', name: 'Porção Batata', unit: 'un', currentQuantity: 12, minQuantity: 4, price: 18, active: true }
    ];
    for (const s of seed) {
      await inventoryRepo.save(s);
    }
    await load();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vendas Semanais: R$ {weeklyTotal.toFixed(2)}</Text>
      <Button title="Seed Produtos (se vazio)" onPress={seedProducts} />
      <FlatList
        style={{ marginTop: 12 }}
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Text style={styles.prodName}>{item.name} (Qtd: {item.currentQuantity})</Text>
            <Button title="Vender 1" onPress={() => createMockSale(item)} />
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum produto cadastrado.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8
  },
  prodName: { fontSize: 15, fontWeight: '500' }
});

export default SalesScreen;