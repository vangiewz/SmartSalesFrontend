// src/lib/db.ts
import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

// Definir el schema de la base de datos
interface SmartSalesDB extends DBSchema {
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'producto'; // Solo productos ahora
      action: 'create' | 'update' | 'delete';
      endpoint: string;
      method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data: any;
      timestamp: number;
      retries: number;
    };
    indexes: { 'by-timestamp': number; 'by-type': string };
  };
  productosCache: {
    key: number;
    value: any;
  };
}

const DB_NAME = 'SmartSalesDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SmartSalesDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SmartSalesDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<SmartSalesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store para la cola de sincronización
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-timestamp', 'timestamp');
        syncStore.createIndex('by-type', 'type');
      }

      // Store para cache de productos
      if (!db.objectStoreNames.contains('productosCache')) {
        db.createObjectStore('productosCache', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// Funciones helper para la cola de sincronización
export async function addToQueue(item: Omit<SmartSalesDB['syncQueue']['value'], 'id' | 'timestamp' | 'retries'>) {
  const db = await getDB();
  const queueItem: SmartSalesDB['syncQueue']['value'] = {
    id: crypto.randomUUID(),
    ...item,
    timestamp: Date.now(),
    retries: 0,
  };
  await db.add('syncQueue', queueItem);
  console.log('📥 Item agregado a cola de sincronización:', queueItem);
  return queueItem;
}

export async function getAllQueueItems() {
  const db = await getDB();
  return db.getAll('syncQueue');
}

export async function deleteQueueItem(id: string) {
  const db = await getDB();
  await db.delete('syncQueue', id);
  console.log('✅ Item eliminado de cola:', id);
}

export async function updateQueueItemRetries(id: string, retries: number) {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    item.retries = retries;
    await db.put('syncQueue', item);
  }
}

export async function clearQueue() {
  const db = await getDB();
  await db.clear('syncQueue');
  console.log('🗑️ Cola de sincronización limpiada');
}

// Funciones helper para cache de productos (ya existía en localStorage, pero ahora en IndexedDB)
export async function saveProductoToCache(producto: any) {
  const db = await getDB();
  await db.put('productosCache', producto);
}

export async function getProductoFromCache(id: number) {
  const db = await getDB();
  return db.get('productosCache', id);
}

export async function getAllProductosFromCache() {
  const db = await getDB();
  return db.getAll('productosCache');
}
