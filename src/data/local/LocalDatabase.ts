// Implementação simples com AsyncStorage (placeholder).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../../domain/models/Product';
import { Sale } from '../../domain/models/Sale';

const PRODUCTS_KEY = 'db_products';
const SALES_KEY = 'db_sales';

async function read<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function write<T>(key: string, list: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

export const LocalDatabase = {
  async getProducts(): Promise<Product[]> {
    return read<Product>(PRODUCTS_KEY);
  },
  async saveProducts(products: Product[]): Promise<void> {
    return write<Product>(PRODUCTS_KEY, products);
  },
  async getSales(): Promise<Sale[]> {
    return read<Sale>(SALES_KEY);
  },
  async saveSales(sales: Sale[]): Promise<void> {
    return write<Sale>(SALES_KEY, sales);
  }
};