import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, ListRenderItemInfo, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
  const route = useRoute<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [barcode, setBarcode] = useState('');

  const cartItems = useMemo(() => Object.entries(cart).map(([productId, qty]) => ({ productId, qty })), [cart]);
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, it) => {
      const p = products.find(x => x.id === it.productId);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
  }, [cartItems, products]);

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

  useEffect(() => {
    const scanned = route.params?.scannedBarcode as string | undefined;
    if (scanned) {
      setBarcode(scanned);
      findByBarcode();
      // clear param
      navigation.setParams({ scannedBarcode: undefined } as any);
    }
  }, [route.params]);

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

  function addToCart(p: Product) {
    setCart(prev => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }));
  }
  function decFromCart(p: Product) {
    setCart(prev => {
      const next = { ...prev };
      const val = (next[p.id] ?? 0) - 1;
      if (val <= 0) delete next[p.id]; else next[p.id] = val;
      return next;
    });
  }
  function clearCart() { setCart({}); }

  async function finalizeCart() {
    if (cartItems.length === 0) return;

    // validate stock
    for (const it of cartItems) {
      const p = products.find(x => x.id === it.productId);
      if (!p) continue;
      if (p.currentQuantity < it.qty) {
        Alert.alert('Estoque insuficiente', `Produto ${p.name} tem apenas ${p.currentQuantity}.`);
        return;
      }
    }

    const sale: Sale = {
      id: 'S-' + Date.now(),
      timestamp: Date.now(),
      items: cartItems.map(it => {
        const p = products.find(x => x.id === it.productId)!;
        return { productId: it.productId, quantity: it.qty, unitPrice: p.price } as SaleItem;
      }),
      total: cartTotal
    };
    await registerSaleUC.execute(sale);
    clearCart();
    await load();
  }

  function findByBarcode() {
    if (!barcode.trim()) return;
    const p = products.find(x => x.barcode === barcode.trim());
    if (p) addToCart(p); else Alert.alert('Não encontrado', 'Código não encontrado.');
    setBarcode('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vendas Semanais: R$ {weeklyTotal.toFixed(2)}</Text>
      <View style={styles.navRow}>
        <Button title="Estoque" onPress={() => navigation.navigate('Inventory')} />
        <Button title="Relatórios" onPress={() => navigation.navigate('Reports')} />
        <Button title="Seed Produtos (se vazio)" onPress={seedProducts} />
        <Button title="Scanner" onPress={() => navigation.navigate('Scanner')} />
      </View>

      <View style={styles.barcodeRow}>
        <TextInput
          placeholder="Código de barras"
          value={barcode}
          onChangeText={setBarcode}
          style={styles.barcodeInput}
          onSubmitEditing={findByBarcode}
        />
        <Button title="OK" onPress={findByBarcode} />
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
            <View style={styles.rowActions}>
              <TouchableOpacity onPress={() => decFromCart(item)} style={styles.circleBtn}><Text>-</Text></TouchableOpacity>
              <Text style={{ width: 24, textAlign: 'center' }}>{cart[item.id] ?? 0}</Text>
              <TouchableOpacity onPress={() => addToCart(item)} style={styles.circleBtn}><Text>+</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum produto cadastrado.</Text>}
      />

      <View style={styles.cartFooter}>
        <Text style={{ fontWeight: '700' }}>Total: R$ {cartTotal.toFixed(2)}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Limpar" onPress={clearCart} />
          <Button title="Finalizar" onPress={finalizeCart} />
        </View>
      </View>
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
  alertText: { fontSize: 12, color: '#5d4037' },
  barcodeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  barcodeInput: { flex: 1, backgroundColor: '#f2f2f2', borderRadius: 6, paddingHorizontal: 8 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  circleBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  cartFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }
});

export default SalesScreen;