import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../../domain/models/Product';
import { InventoryRepositoryImpl } from '../../data/repositories/InventoryRepositoryImpl';
import { SalesRepositoryImpl } from '../../data/repositories/SalesRepositoryImpl';
import { RegisterSaleUseCase } from '../../domain/usecases/RegisterSaleUseCase';
import { GetLowStockAlertsUseCase } from '../../domain/usecases/GetLowStockAlertsUseCase';
import { Sale, SaleItem } from '../../domain/models/Sale';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const inventoryRepo = new InventoryRepositoryImpl();
const salesRepo = new SalesRepositoryImpl();
const registerSaleUC = new RegisterSaleUseCase(salesRepo, inventoryRepo);
const lowStockUC = new GetLowStockAlertsUseCase(inventoryRepo);

const SalesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);

  async function load() {
    const [p, wt, low] = await Promise.all([
      inventoryRepo.getAll(),
      salesRepo.getWeeklyTotal(),
      lowStockUC.execute()
    ]);
    setProducts(p);
    setWeeklyTotal(wt);
    setLowStock(low);
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
      <View style={styles.navRow}>
        <Button title="Estoque" onPress={() => navigation.navigate('Inventory')} />
        <Button title="Relatórios" onPress={() => navigation.navigate('Reports')} />
        <Button title="Seed Produtos (se vazio)" onPress={seedProducts} />
      </View>

      {lowStock.length > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>Alerta de Estoque Baixo</Text>
          <FlatList<Product>
            data={lowStock}
            keyExtractor={(item: Product) => item.id}
            horizontal
            renderItem={({ item }: ListRenderItemInfo<Product>) => (
              <View style={styles.alertItem}>
                <Text style={styles.alertText}>{item.name}: {item.currentQuantity}/{item.minQuantity}</Text>
              </View>
            )}
          />
        </View>
      )}

      <FlatList<Product>
        style={{ marginTop: 12 }}
        data={products}
        keyExtractor={(item: Product) => item.id}
        renderItem={({ item }: ListRenderItemInfo<Product>) => (
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
  navRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8
  },
  prodName: { fontSize: 15, fontWeight: '500' },
  alertBox: { marginTop: 12, padding: 10, backgroundColor: '#fff7e6', borderRadius: 8, borderWidth: 1, borderColor: '#ffe0b2' },
  alertTitle: { fontWeight: '700', marginBottom: 6, color: '#b26a00' },
  alertItem: { paddingVertical: 4, paddingHorizontal: 8, marginRight: 8, borderRadius: 12, backgroundColor: '#ffe0b2' },
  alertText: { fontSize: 12, color: '#5d4037' }
});

export default SalesScreen;