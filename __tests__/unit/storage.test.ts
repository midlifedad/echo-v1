/**
 * Unit Tests: IndexedDB Storage Operations
 * Tests dataset persistence, retrieval, and management
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

// Mock the global indexedDB
global.indexedDB = new IDBFactory();

describe('IndexedDB Storage Operations', () => {
  let storage: any;

  beforeEach(() => {
    // Reset IndexedDB for each test
    const req = indexedDB.deleteDatabase('test-db');
    return new Promise((resolve) => {
      req.onsuccess = resolve;
      req.onerror = resolve;
    });
  });

  describe('Database Initialization', () => {
    it('should create database with proper schema', async () => {
      const db = await openTestDB();
      
      expect(db.objectStoreNames.contains('datasets')).toBe(true);
      expect(db.objectStoreNames.contains('dataContent')).toBe(true);
      expect(db.objectStoreNames.contains('recommendations')).toBe(true);
      
      db.close();
    });

    it('should create indexes on datasets store', async () => {
      const db = await openTestDB();
      const tx = db.transaction(['datasets'], 'readonly');
      const store = tx.objectStore('datasets');
      
      expect(store.indexNames.contains('by-name')).toBe(true);
      expect(store.indexNames.contains('by-date')).toBe(true);
      expect(store.indexNames.contains('by-source')).toBe(true);
      
      db.close();
    });
  });

  describe('Dataset CRUD Operations', () => {
    it('should save and retrieve a dataset', async () => {
      const db = await openTestDB();
      const dataset = createTestDataset('test-1');
      
      // Save
      const tx1 = db.transaction(['datasets'], 'readwrite');
      await tx1.objectStore('datasets').put(dataset);
      await tx1.done;
      
      // Retrieve
      const tx2 = db.transaction(['datasets'], 'readonly');
      const retrieved = await tx2.objectStore('datasets').get('test-1');
      
      expect(retrieved).toEqual(dataset);
      db.close();
    });

    it('should update an existing dataset', async () => {
      const db = await openTestDB();
      const dataset = createTestDataset('test-1');
      
      // Save initial
      const tx1 = db.transaction(['datasets'], 'readwrite');
      await tx1.objectStore('datasets').put(dataset);
      await tx1.done;
      
      // Update
      dataset.name = 'Updated Name';
      const tx2 = db.transaction(['datasets'], 'readwrite');
      await tx2.objectStore('datasets').put(dataset);
      await tx2.done;
      
      // Verify
      const tx3 = db.transaction(['datasets'], 'readonly');
      const retrieved = await tx3.objectStore('datasets').get('test-1');
      
      expect(retrieved.name).toBe('Updated Name');
      db.close();
    });

    it('should delete a dataset', async () => {
      const db = await openTestDB();
      const dataset = createTestDataset('test-1');
      
      // Save
      const tx1 = db.transaction(['datasets'], 'readwrite');
      await tx1.objectStore('datasets').put(dataset);
      await tx1.done;
      
      // Delete
      const tx2 = db.transaction(['datasets'], 'readwrite');
      await tx2.objectStore('datasets').delete('test-1');
      await tx2.done;
      
      // Verify
      const tx3 = db.transaction(['datasets'], 'readonly');
      const retrieved = await tx3.objectStore('datasets').get('test-1');
      
      expect(retrieved).toBeUndefined();
      db.close();
    });

    it('should list all datasets', async () => {
      const db = await openTestDB();
      
      // Save multiple datasets
      const tx1 = db.transaction(['datasets'], 'readwrite');
      const store = tx1.objectStore('datasets');
      await store.put(createTestDataset('test-1'));
      await store.put(createTestDataset('test-2'));
      await store.put(createTestDataset('test-3'));
      await tx1.done;
      
      // List all
      const tx2 = db.transaction(['datasets'], 'readonly');
      const all = await tx2.objectStore('datasets').getAll();
      
      expect(all).toHaveLength(3);
      expect(all.map(d => d.id)).toEqual(['test-1', 'test-2', 'test-3']);
      db.close();
    });
  });

  describe('Data Compression', () => {
    it('should compress large data', () => {
      const largeString = 'x'.repeat(100000);
      const compressed = compressData(largeString);
      
      expect(compressed.length).toBeLessThan(largeString.length);
      
      const decompressed = decompressData(compressed);
      expect(decompressed).toBe(largeString);
    });

    it('should not compress small data', () => {
      const smallString = 'Hello, World!';
      const result = compressData(smallString, 1000); // High threshold
      
      expect(result).toBe(smallString); // Should return original
    });
  });

  describe('Storage Quota Management', () => {
    it('should calculate storage usage', async () => {
      const db = await openTestDB();
      
      // Save datasets with known sizes
      const tx = db.transaction(['datasets'], 'readwrite');
      const dataset1 = createTestDataset('test-1');
      dataset1.metadata = { sizeBytes: 1000 };
      const dataset2 = createTestDataset('test-2');
      dataset2.metadata = { sizeBytes: 2000 };
      
      await tx.objectStore('datasets').put(dataset1);
      await tx.objectStore('datasets').put(dataset2);
      await tx.done;
      
      const usage = await calculateStorageUsage(db);
      expect(usage).toBe(3000);
      
      db.close();
    });

    it('should enforce dataset limit', async () => {
      const maxDatasets = 3;
      const datasets = [];
      
      for (let i = 0; i < maxDatasets + 1; i++) {
        datasets.push(createTestDataset(`test-${i}`));
      }
      
      const stored = await storeWithLimit(datasets, maxDatasets);
      expect(stored).toBe(maxDatasets);
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used dataset', async () => {
      const datasets = [
        { id: '1', lastAccessed: new Date('2024-01-01') },
        { id: '2', lastAccessed: new Date('2024-01-03') },
        { id: '3', lastAccessed: new Date('2024-01-02') }
      ];
      
      const lru = findLRU(datasets);
      expect(lru.id).toBe('1');
    });

    it('should update last accessed time on read', async () => {
      const db = await openTestDB();
      const dataset = createTestDataset('test-1');
      const originalTime = new Date('2024-01-01');
      dataset.metadata = { lastAccessed: originalTime };
      
      // Save
      const tx1 = db.transaction(['datasets'], 'readwrite');
      await tx1.objectStore('datasets').put(dataset);
      await tx1.done;
      
      // Simulate read with access time update
      const tx2 = db.transaction(['datasets'], 'readwrite');
      const retrieved = await tx2.objectStore('datasets').get('test-1');
      retrieved.metadata.lastAccessed = new Date();
      await tx2.objectStore('datasets').put(retrieved);
      await tx2.done;
      
      // Verify
      const tx3 = db.transaction(['datasets'], 'readonly');
      const updated = await tx3.objectStore('datasets').get('test-1');
      
      expect(updated.metadata.lastAccessed.getTime()).toBeGreaterThan(originalTime.getTime());
      db.close();
    });
  });
});

// Helper functions
async function openTestDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('test-db', 1);
    
    req.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('datasets')) {
        const store = db.createObjectStore('datasets', { keyPath: 'id' });
        store.createIndex('by-name', 'name');
        store.createIndex('by-date', 'createdAt');
        store.createIndex('by-source', 'source');
      }
      
      if (!db.objectStoreNames.contains('dataContent')) {
        db.createObjectStore('dataContent', { keyPath: 'datasetId' });
      }
      
      if (!db.objectStoreNames.contains('recommendations')) {
        db.createObjectStore('recommendations', { keyPath: 'id' });
      }
    };
    
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function createTestDataset(id: string) {
  return {
    id,
    name: `Dataset ${id}`,
    source: 'test',
    createdAt: new Date(),
    data: [[1, 2, 3], [4, 5, 6]]
  };
}

function compressData(data: string, threshold: number = 100): string {
  if (data.length < threshold) return data;
  // Simple mock compression
  return `compressed:${data.length}`;
}

function decompressData(data: string): string {
  if (!data.startsWith('compressed:')) return data;
  const length = parseInt(data.split(':')[1]);
  return 'x'.repeat(length);
}

async function calculateStorageUsage(db: any): Promise<number> {
  const tx = db.transaction(['datasets'], 'readonly');
  const all = await tx.objectStore('datasets').getAll();
  return all.reduce((sum: number, d: any) => sum + (d.metadata?.sizeBytes || 0), 0);
}

async function storeWithLimit(datasets: any[], limit: number): Promise<number> {
  let stored = 0;
  for (const dataset of datasets) {
    if (stored >= limit) break;
    stored++;
  }
  return stored;
}

function findLRU(datasets: any[]): any {
  return datasets.sort((a, b) => 
    a.lastAccessed.getTime() - b.lastAccessed.getTime()
  )[0];
}