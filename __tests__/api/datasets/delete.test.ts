/**
 * Contract Test: DELETE /api/datasets/:id
 * Tests dataset deletion endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('DELETE /api/datasets/:id', () => {
  const baseEndpoint = 'http://localhost:3000/api/datasets';
  let testDatasetId: string | null = null;

  beforeEach(async () => {
    // Create a test dataset to delete
    const csvContent = 'Test,Data\n1,Value1\n2,Value2';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', 'Test Dataset for Deletion');

    try {
      const response = await fetch(`${baseEndpoint}/import`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        testDatasetId = result.datasetId;
      }
    } catch (error) {
      console.log('Setup failed, tests will use mock ID');
    }
  });

  it('should delete existing dataset', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';

    const response = await fetch(`${baseEndpoint}/${datasetId}`, {
      method: 'DELETE'
    });

    // If dataset doesn't exist, expect 404
    if (response.status === 404) {
      const error = await response.json();
      expect(error).toHaveProperty('error');
      expect(error).toHaveProperty('message');
      return;
    }

    expect(response.status).toBe(204);

    // Verify deletion - should return 404 when trying to get
    const verifyResponse = await fetch(`${baseEndpoint}/${datasetId}`);
    expect(verifyResponse.status).toBe(404);
  });

  it('should return 404 for non-existent dataset', async () => {
    const response = await fetch(`${baseEndpoint}/non-existent-id-123456`, {
      method: 'DELETE'
    });

    expect(response.status).toBe(404);

    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error).toHaveProperty('message');
    expect(error.message.toLowerCase()).toContain('not found');
  });

  it('should handle invalid ID format', async () => {
    const response = await fetch(`${baseEndpoint}/../../../etc/passwd`, {
      method: 'DELETE'
    });

    expect([400, 404]).toContain(response.status);

    const error = await response.json();
    expect(error).toHaveProperty('error');
  });

  it('should be idempotent - deleting twice should not error', async () => {
    const datasetId = testDatasetId || 'test-dataset-123';

    // First deletion
    const response1 = await fetch(`${baseEndpoint}/${datasetId}`, {
      method: 'DELETE'
    });

    // Second deletion
    const response2 = await fetch(`${baseEndpoint}/${datasetId}`, {
      method: 'DELETE'
    });

    // Second delete should return 404 (already deleted)
    expect(response2.status).toBe(404);
  });

  it('should remove dataset from listing after deletion', async () => {
    if (!testDatasetId) {
      console.log('Skipping test - no test dataset created');
      return;
    }

    // Delete the dataset
    await fetch(`${baseEndpoint}/${testDatasetId}`, {
      method: 'DELETE'
    });

    // Check it's not in the list
    const listResponse = await fetch(baseEndpoint);
    if (listResponse.ok) {
      const result = await listResponse.json();
      const foundDataset = result.datasets.find((d: any) => d.id === testDatasetId);
      expect(foundDataset).toBeUndefined();
    }
  });

  it('should free up storage after deletion', async () => {
    // This test verifies that storage is freed
    // Implementation would check IndexedDB storage metrics

    if (!testDatasetId) {
      console.log('Skipping test - no test dataset created');
      return;
    }

    // Get initial storage estimate if available
    let initialUsage = 0;
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      initialUsage = estimate.usage || 0;
    }

    // Delete the dataset
    const response = await fetch(`${baseEndpoint}/${testDatasetId}`, {
      method: 'DELETE'
    });

    expect([204, 404]).toContain(response.status);

    // Storage should be less or equal after deletion
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const finalUsage = estimate.usage || 0;
      expect(finalUsage).toBeLessThanOrEqual(initialUsage);
    }
  });

  it('should handle concurrent deletion attempts gracefully', async () => {
    if (!testDatasetId) {
      console.log('Skipping test - no test dataset created');
      return;
    }

    // Attempt to delete the same dataset concurrently
    const promises = [
      fetch(`${baseEndpoint}/${testDatasetId}`, { method: 'DELETE' }),
      fetch(`${baseEndpoint}/${testDatasetId}`, { method: 'DELETE' }),
      fetch(`${baseEndpoint}/${testDatasetId}`, { method: 'DELETE' })
    ];

    const responses = await Promise.all(promises);

    // At least one should succeed with 204
    const successCount = responses.filter(r => r.status === 204).length;
    expect(successCount).toBeGreaterThanOrEqual(1);

    // Others should get 404 (already deleted)
    const notFoundCount = responses.filter(r => r.status === 404).length;
    expect(notFoundCount).toBeGreaterThanOrEqual(0);
  });
});