import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { InventoryRepositoryImpl } from '../../data/repositories/InventoryRepositoryImpl';
import { Product } from '../../domain/models/Product';
import { ProductItem } from '../../components/ProductItem';
import { AdjustInventoryUseCase } from '../../domain/usecases/AdjustInventoryUseCase';

const inventoryRepo = new InventoryRepositoryImpl();
const adjustInventoryUC = new AdjustInventoryUseCase(inventoryRepo);

const InventoryScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');

  async function load() {
    const p = await inventoryRepo.getAll();
    setProducts(p);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProduct() {
    if (!name || !qty || !price) {
      Alert.alert('Campos incompletos', 'Preencha nome, quantidade e preço.');
      return;
    }
    const product: Product = {
      id: 'P-' + Date.now(),
      name,
      unit: 'un',
      currentQuantity: Number(qty),
      minQuantity: Math.max(1, Math.floor(Number(qty) * 0.2)),
      price: Number(price),
      active: true
    };
    await inventoryRepo.save(product);
    setName('');
    setQty('');
    setPrice('');
    await load();
  }

  async function inc(p: Product) {
    await adjustInventoryUC.execute(p.id, 1, 'Ajuste manual +1');
    await load();
  }
  async function dec(p: Product) {
    if (p.currentQuantity <= 0) return;
    await adjustInventoryUC.execute(p.id, -1, 'Ajuste manual -1');
    await load();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoque</Text>
      <View style={styles.formRow}>
        <TextInput placeholder="Nome" style={styles.input} value={name} onChangeText={setName} />
        <TextInput placeholder="Qtd" style={styles.input} value={qty} onChangeText={setQty} keyboardType="numeric" />
        <TextInput placeholder="Preço" style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
      </View>
      <Button title="Adicionar" onPress={addProduct} />
      <FlatList<Product>
        style={{ marginTop: 16 }}
        data={products}
        keyExtractor={(item: Product) => item.id}
        renderItem={({ item }: { item: Product }) => (
          <View style={styles.item}>
            <ProductItem product={item} />
            <View style={styles.actions}>
              <Button title="-1" onPress={() => dec(item)} />
              <Button title="+1" onPress={() => inc(item)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum produto.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  input: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: '28%',
    marginBottom: 8
  },
  item: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    marginBottom: 8
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }
});

export default InventoryScreen;