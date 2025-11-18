// Armazenamento local com MMKV (rápido) e fallback para AsyncStorage; opcional SQLite.
// Armazenamento local com MMKV (rápido) e fallback para AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import SQLite from 'react-native-sqlite-storage';
import { Product } from '../../domain/models/Product';
import { Sale } from '../../domain/models/Sale';
import { USE_SQLITE } from '../../core/constants';

const PRODUCTS_KEY = 'db_products';
const SALES_KEY = 'db_sales';

const storage = new MMKV();

// SQLite helpers (store JSON for simplicidade)
let db: SQLite.SQLiteDatabase | undefined;
async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabase({ name: 'app.db', location: 'default' });
  await new Promise<void>((resolve, reject) =>
    db!.transaction((tx: any) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)');
    }, reject as any, resolve)
  );
  return db!;
}

async function sqliteRead(key: string): Promise<string | null> {
  const database = await getDB();
  return new Promise((resolve, reject) =>
    database.executeSql('SELECT v FROM kv WHERE k = ?', [key], (_tx: any, res: any) => {
      if (res.rows.length > 0) resolve(res.rows.item(0).v as string); else resolve(null);
    }, (_tx: any, err: any) => { reject(err); return false; })
  );
}

async function sqliteWrite(key: string, value: string): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) =>
    database.executeSql('REPLACE INTO kv (k, v) VALUES (?, ?)', [key, value], () => resolve(), (_tx: any, err: any) => { reject(err); return false; })
  );
}

function has(key: string): boolean {
  try { return storage.contains(key); } catch { return false; }
}

async function read<T>(key: string): Promise<T[]> {
  if (USE_SQLITE) {
    const row = await sqliteRead(key);
    if (!row) return [];
    try { return JSON.parse(row) as T[]; } catch { return []; }
  }
  try {
    if (has(key)) {
      const raw = storage.getString(key);
      if (!raw) return [];
      return JSON.parse(raw) as T[];
    }
  } catch {}
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw) as T[]; } catch { return []; }
}

async function write<T>(key: string, list: T[]): Promise<void> {
  const payload = JSON.stringify(list);
  if (USE_SQLITE) return sqliteWrite(key, payload);
  try { storage.set(key, payload); } catch { await AsyncStorage.setItem(key, payload); }
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