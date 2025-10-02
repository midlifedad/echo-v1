/**
 * IndexedDB Database Configuration for Data Import
 * Manages persistent storage for imported datasets with compression
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import LZString from 'lz-string';
import {
  Dataset,
  DatasetListItem,
  DatasetPreview,
  DataValidationResult,
  StorageQuota,
  DatasetQuery
} from '../types/dataset';

// Database schema definition
interface DataImportDB extends DBSchema {
  datasets: {
    key: string;
    value: Dataset;
    indexes: {
      'by-name': string;
      'by-date': Date;
      'by-source': string;
      'by-size': number;
    };
  };
  dataContent: {
    key: string; // datasetId
    value: {
      datasetId: string;
      data: string; // Compressed data
      compressed: boolean;
      originalSize: number;
    };
  };
  recommendations: {
    key: string;
    value: {
      id: string;
      datasetId: string;
      chartType: string;
      recommendations: any[];
      createdAt: Date;
    };
    indexes: {
      'by-dataset': string;
    };
  };
  sessions: {
    key: string;
    value: {
      id: string;
      status: string;
      datasetId?: string;
      startedAt: Date;
      completedAt?: Date;
    };
  };
}

const DB_NAME = 'echo-data-import';
const DB_VERSION = 1;

// Storage configuration limits
export const STORAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB in bytes
  maxRows: 10000,
  maxColumns: 200,
  maxDatasets: 50,
  compressionThreshold: 100 * 1024, // Compress if > 100KB
  dbName: DB_NAME,
  version: DB_VERSION
};

class DataImportDatabase {
  private db: IDBPDatabase<DataImportDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<DataImportDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create datasets store
        if (!db.objectStoreNames.contains('datasets')) {
          const datasetStore = db.createObjectStore('datasets', {
            keyPath: 'id'
          });
          datasetStore.createIndex('by-name', 'name');
          datasetStore.createIndex('by-date', ['metadata', 'createdAt']);
          datasetStore.createIndex('by-source', ['metadata', 'source']);
          datasetStore.createIndex('by-size', ['metadata', 'sizeBytes']);
        }

        // Create data content store (actual CSV data)
        if (!db.objectStoreNames.contains('dataContent')) {
          db.createObjectStore('dataContent', {
            keyPath: 'datasetId'
          });
        }

        // Create recommendations store
        if (!db.objectStoreNames.contains('recommendations')) {
          const recStore = db.createObjectStore('recommendations', {
            keyPath: 'id'
          });
          recStore.createIndex('by-dataset', 'datasetId');
        }

        // Create sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', {
            keyPath: 'id'
          });
        }
      },
      blocked() {
        console.error('Database blocked. Please close other tabs.');
      },
      blocking() {
        console.warn('Database blocking other connections.');
      },
      terminated() {
        console.error('Database connection terminated unexpectedly.');
      }
    });
  }

  private async ensureConnection(): Promise<IDBPDatabase<DataImportDB>> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  // Dataset operations
  async saveDataset(dataset: Dataset): Promise<void> {
    const db = await this.ensureConnection();

    // Check storage quota
    const quota = await this.getStorageQuota();
    if (quota.datasets >= STORAGE_CONFIG.maxDatasets) {
      // Implement LRU eviction
      await this.evictOldestDataset();
    }

    const tx = db.transaction(['datasets', 'dataContent'], 'readwrite');

    try {
      // Prepare data for storage
      const dataString = JSON.stringify(dataset.data);
      const dataSize = new Blob([dataString]).size;

      let storedData: string;
      let compressed = false;

      // Compress if data exceeds threshold
      if (dataSize > STORAGE_CONFIG.compressionThreshold) {
        storedData = LZString.compressToUTF16(dataString);
        compressed = true;
      } else {
        storedData = dataString;
      }

      // Update dataset metadata
      dataset.metadata.sizeBytes = dataSize;
      dataset.metadata.compressed = compressed;
      dataset.metadata.lastAccessed = new Date();

      // Save dataset metadata
      await tx.objectStore('datasets').put(dataset);

      // Save compressed data content
      await tx.objectStore('dataContent').put({
        datasetId: dataset.id,
        data: storedData,
        compressed,
        originalSize: dataSize
      });

      await tx.done;
    } catch (error) {
      console.error('Failed to save dataset:', error);
      throw new Error('Failed to save dataset to storage');
    }
  }

  async getDataset(id: string): Promise<Dataset | null> {
    const db = await this.ensureConnection();
    const dataset = await db.get('datasets', id);

    if (!dataset) return null;

    // Update last accessed time
    dataset.metadata.lastAccessed = new Date();
    await db.put('datasets', dataset);

    // Fetch and decompress data
    const content = await db.get('dataContent', id);
    if (content) {
      const dataString = content.compressed
        ? LZString.decompressFromUTF16(content.data)
        : content.data;

      if (dataString) {
        dataset.data = JSON.parse(dataString);
      }
    }

    return dataset;
  }

  async getDatasetPreview(id: string, rows: number = 10): Promise<DatasetPreview | null> {
    const db = await this.ensureConnection();
    const dataset = await db.get('datasets', id);

    if (!dataset) return null;

    const content = await db.get('dataContent', id);
    if (!content) return null;

    const dataString = content.compressed
      ? LZString.decompressFromUTF16(content.data)
      : content.data;

    if (!dataString) return null;

    const fullData = JSON.parse(dataString);
    const previewData = fullData.slice(0, rows + 1); // +1 for headers

    return {
      id: dataset.id,
      name: dataset.name,
      rows: previewData,
      totalRows: dataset.statistics.rowCount,
      columns: dataset.columns
    };
  }

  async listDatasets(query?: DatasetQuery): Promise<{ datasets: DatasetListItem[]; total: number }> {
    const limit = query?.limit ?? 20;
    const offset = query?.offset ?? 0;
    const sortBy = query?.sortBy ?? 'createdAt';
    const order = query?.sortOrder ?? 'desc';
    const db = await this.ensureConnection();
    const tx = db.transaction('datasets', 'readonly');
    const store = tx.objectStore('datasets');

    let datasets: Dataset[] = [];

    // Select appropriate index
    let index;
    switch (sortBy) {
      case 'createdAt':
      case 'updatedAt':
        index = store.index('by-date');
        break;
      case 'size':
        index = store.index('by-size');
        break;
      case 'name':
      default:
        index = store.index('by-name');
        break;
    }

    const direction = order === 'desc' ? 'prev' : 'next';
    let cursor = await index.openCursor(null, direction);

    while (cursor) {
      const dataset = cursor.value;

      // Apply filters
      if (query?.search) {
        const searchLower = query.search.toLowerCase();
        if (!dataset.name.toLowerCase().includes(searchLower) &&
            !dataset.description?.toLowerCase().includes(searchLower)) {
          cursor = await cursor.continue();
          continue;
        }
      }

      if (query?.tags && query.tags.length > 0) {
        const hasTag = query.tags.some(tag => dataset.tags?.includes(tag));
        if (!hasTag) {
          cursor = await cursor.continue();
          continue;
        }
      }

      datasets.push(dataset);
      cursor = await cursor.continue();
    }

    const total = datasets.length;
    const paginated = datasets.slice(offset, offset + limit);

    // Convert to list item format
    const listItems: DatasetListItem[] = paginated.map(ds => ({
      id: ds.id,
      name: ds.name,
      description: ds.description,
      rowCount: ds.statistics.rowCount,
      columnCount: ds.statistics.columnCount,
      createdAt: ds.metadata.createdAt,
      updatedAt: ds.metadata.updatedAt,
      sizeBytes: ds.metadata.sizeBytes,
      tags: ds.tags
    }));

    return { datasets: listItems, total };
  }

  async deleteDataset(id: string): Promise<void> {
    const db = await this.ensureConnection();
    const tx = db.transaction(['datasets', 'dataContent', 'recommendations'], 'readwrite');

    try {
      // Delete dataset metadata
      await tx.objectStore('datasets').delete(id);

      // Delete data content
      await tx.objectStore('dataContent').delete(id);

      // Delete associated recommendations
      const recStore = tx.objectStore('recommendations');
      const index = recStore.index('by-dataset');
      let cursor = await index.openCursor(id);

      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }

      await tx.done;
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      throw new Error('Failed to delete dataset');
    }
  }

  // Recommendation operations
  async saveRecommendations(
    datasetId: string,
    recommendations: any[]
  ): Promise<void> {
    const db = await this.ensureConnection();
    const id = `rec-${datasetId}-${Date.now()}`;

    await db.put('recommendations', {
      id,
      datasetId,
      chartType: 'multiple',
      recommendations,
      createdAt: new Date()
    });
  }

  async getRecommendations(datasetId: string): Promise<any[]> {
    const db = await this.ensureConnection();
    const index = db.transaction('recommendations').store.index('by-dataset');
    const recs = await index.getAll(datasetId);

    if (recs.length > 0) {
      // Return the most recent recommendations
      recs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return recs[0].recommendations;
    }

    return [];
  }

  // Session operations
  async saveSession(session: any): Promise<void> {
    const db = await this.ensureConnection();
    await db.put('sessions', session);
  }

  async getSession(id: string): Promise<any> {
    const db = await this.ensureConnection();
    return db.get('sessions', id);
  }

  async getCurrentSession(): Promise<any> {
    const db = await this.ensureConnection();
    const sessions = await db.getAll('sessions');

    // Find the most recent incomplete session
    const incompleteSessions = sessions.filter(s => !s.completedAt);
    if (incompleteSessions.length > 0) {
      incompleteSessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      return incompleteSessions[0];
    }

    return null;
  }

  // Utility methods
  async clearAll(): Promise<void> {
    const db = await this.ensureConnection();
    const tx = db.transaction(['datasets', 'dataContent', 'recommendations', 'sessions'], 'readwrite');

    await Promise.all([
      tx.objectStore('datasets').clear(),
      tx.objectStore('dataContent').clear(),
      tx.objectStore('recommendations').clear(),
      tx.objectStore('sessions').clear()
    ]);

    await tx.done;
  }

  async getStorageQuota(): Promise<StorageQuota> {
    const db = await this.ensureConnection();
    const datasets = await db.getAll('datasets');

    let totalSize = 0;
    let oldestDate: Date | undefined;
    let newestDate: Date | undefined;

    datasets.forEach(ds => {
      totalSize += ds.metadata?.sizeBytes || 0;
    });

    // Get browser storage estimate
    let quota = 0;
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      quota = estimate.quota || 0;
    }

    return {
      usage: totalSize,
      quota: quota || 50 * 1024 * 1024, // Default 50MB
      datasets: datasets.length,
      maxDatasets: STORAGE_CONFIG.maxDatasets
    };
  }

  async evictOldestDataset(): Promise<void> {
    const db = await this.ensureConnection();
    const datasets = await db.getAll('datasets');

    if (datasets.length === 0) return;

    // Sort by last accessed time (LRU)
    datasets.sort((a, b) => {
      const aTime = a.metadata.lastAccessed?.getTime() || a.metadata.createdAt.getTime();
      const bTime = b.metadata.lastAccessed?.getTime() || b.metadata.createdAt.getTime();
      return aTime - bTime;
    });

    // Delete the least recently used dataset
    await this.deleteDataset(datasets[0].id);
  }

  async validateDataset(dataset: Dataset): Promise<DataValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Check size limits
    if (dataset.statistics.rowCount > STORAGE_CONFIG.maxRows) {
      errors.push({
        type: 'constraint_violation',
        message: `Row count (${dataset.statistics.rowCount}) exceeds maximum (${STORAGE_CONFIG.maxRows})`
      });
    }

    if (dataset.statistics.columnCount > STORAGE_CONFIG.maxColumns) {
      errors.push({
        type: 'constraint_violation',
        message: `Column count (${dataset.statistics.columnCount}) exceeds maximum (${STORAGE_CONFIG.maxColumns})`
      });
    }

    if (dataset.metadata.sizeBytes && dataset.metadata.sizeBytes > STORAGE_CONFIG.maxFileSize) {
      errors.push({
        type: 'constraint_violation',
        message: `File size exceeds maximum (${STORAGE_CONFIG.maxFileSize / 1024 / 1024}MB)`
      });
    }

    // Check for suspicious data patterns
    if (dataset.statistics.nullCount &&
        dataset.statistics.nullCount > dataset.statistics.rowCount * 0.5) {
      warnings.push({
        type: 'suspicious_value',
        message: 'More than 50% of data contains null values'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRows: dataset.statistics.rowCount,
        validRows: dataset.statistics.rowCount - (dataset.statistics.nullCount || 0),
        errorRows: 0,
        warningRows: warnings.length
      }
    };
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async clear(): Promise<void> {
    await this.clearAll();
  }

  async save(dataset: Dataset): Promise<void> {
    await this.saveDataset(dataset);
  }

  async get(id: string): Promise<Dataset | null> {
    return this.getDataset(id);
  }

  async list(query?: DatasetQuery): Promise<DatasetListItem[]> {
    const result = await this.listDatasets(query);
    return result.datasets;
  }
}

// Export singleton instance
export const dataImportDB = new DataImportDatabase();
export const datasetStorage = dataImportDB; // Alias for compatibility

// Helper functions
export async function initDatabase(): Promise<void> {
  await dataImportDB.init();
}

export async function isStorageAvailable(): Promise<boolean> {
  if (!('indexedDB' in window)) {
    return false;
  }

  try {
    const testDB = await openDB('test-db', 1);
    testDB.close();
    await deleteDB('test-db');
    return true;
  } catch {
    return false;
  }
}

async function deleteDB(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const deleteReq = indexedDB.deleteDatabase(name);
    deleteReq.onsuccess = () => resolve();
    deleteReq.onerror = () => reject(deleteReq.error);
  });
}