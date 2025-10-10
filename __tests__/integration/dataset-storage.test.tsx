/**
 * Integration Test: Dataset Persistence and Retrieval
 * Tests IndexedDB storage functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { datasetStorage } from '@/lib/services/datasetStorage';

describe('Dataset Storage Integration', () => {
  beforeEach(async () => {
    // Clear storage before each test
    await datasetStorage.clear();
  });

  it('should store and retrieve datasets', async () => {
    const testDataset = {
      id: 'test-123',
      name: 'Test Dataset',
      data: [[1, 2, 3], [4, 5, 6]],
      columns: [
        { name: 'A', dataType: 'number' },
        { name: 'B', dataType: 'number' },
        { name: 'C', dataType: 'number' }
      ],
      rowCount: 2,
      columnCount: 3
    };

    // Store dataset
    await datasetStorage.save(testDataset);

    // Retrieve dataset
    const retrieved = await datasetStorage.get('test-123');
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('Test Dataset');
    expect(retrieved.data).toEqual([[1, 2, 3], [4, 5, 6]]);
  });

  it('should list all stored datasets', async () => {
    // Store multiple datasets
    for (let i = 1; i <= 5; i++) {
      await datasetStorage.save({
        id: `dataset-${i}`,
        name: `Dataset ${i}`,
        data: [[i]],
        createdAt: new Date(2024, 0, i)
      });
    }

    // List datasets
    const list = await datasetStorage.list();
    expect(list).toHaveLength(5);

    // Should be sorted by createdAt descending
    expect(list[0].name).toBe('Dataset 5');
  });

  it('should handle large datasets with compression', async () => {
    // Generate large dataset (>1MB)
    const largeData = [];
    for (let i = 0; i < 10000; i++) {
      largeData.push(Array(50).fill(Math.random()));
    }

    const largeDataset = {
      id: 'large-dataset',
      name: 'Large Dataset',
      data: largeData,
      rowCount: 10000,
      columnCount: 50
    };

    // Should compress and store
    await datasetStorage.save(largeDataset);

    // Should decompress on retrieval
    const retrieved = await datasetStorage.get('large-dataset');
    expect(retrieved.rowCount).toBe(10000);
    expect(retrieved.data.length).toBe(10000);
  });

  it('should implement LRU eviction when storage is full', async () => {
    // Fill storage near capacity
    const datasets = [];
    for (let i = 1; i <= 60; i++) {
      datasets.push({
        id: `dataset-${i}`,
        name: `Dataset ${i}`,
        data: Array(1000).fill([1, 2, 3]),
        lastAccessed: new Date(2024, 0, i)
      });
    }

    // Store all datasets
    for (const dataset of datasets) {
      await datasetStorage.save(dataset);
    }

    // Should have evicted oldest/least recently used
    const list = await datasetStorage.list();
    expect(list.length).toBeLessThanOrEqual(50); // Max 50 datasets

    // Oldest should be evicted
    const oldestExists = await datasetStorage.get('dataset-1');
    expect(oldestExists).toBeNull();
  });

  afterEach(async () => {
    await datasetStorage.clear();
  });
});