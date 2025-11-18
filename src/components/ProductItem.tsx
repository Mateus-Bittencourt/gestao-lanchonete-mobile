import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Product } from '../domain/models/Product';

interface Props {
  product: Product;
}

export const ProductItem: React.FC<Props> = ({ product }) => {
  const low = product.currentQuantity <= product.minQuantity;
  return (
    <View style={[styles.card, low && styles.low]}>
      <Text style={styles.title}>{product.name}</Text>
      <Text>Qtd: {product.currentQuantity} {product.unit}</Text>
      <Text>Mín: {product.minQuantity} {product.unit}</Text>
      <Text>Preço: R$ {product.price.toFixed(2)}</Text>
      {low && <Text style={styles.alert}>ALERTA: Repor!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    elevation: 2
  },
  low: {
    borderWidth: 1,
    borderColor: '#d9534f'
  },
  title: { fontSize: 16, fontWeight: '600' },
  alert: { marginTop: 4, color: '#d9534f', fontWeight: '700' }
});