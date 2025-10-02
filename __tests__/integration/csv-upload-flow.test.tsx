/**
 * Integration Test: CSV Upload to Chart Generation Flow
 * Tests the complete workflow from CSV upload to AI chart recommendations
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import DataImportFlow from '@/components/data/DataImportFlow';

// Mock the Chart-MCP service
jest.mock('@/lib/services/chartMCP', () => ({
  chartMCPService: {
    generateCharts: jest.fn().mockResolvedValue({
      recommended: {
        id: 'chart-1',
        chartType: 'line',
        confidence: 0.95,
        rationale: 'Time series data best shown as line chart',
        config: {}
      },
      alternatives: [
        { id: 'chart-2', chartType: 'area', confidence: 0.85 },
        { id: 'chart-3', chartType: 'column', confidence: 0.75 }
      ]
    })
  }
}));

describe('CSV Upload to Chart Generation Integration', () => {
  const user = userEvent.setup();

  it('should complete full workflow from CSV upload to chart creation', async () => {
    const onComplete = jest.fn();
    const onCancel = jest.fn();

    const { container } = render(
      <DataImportFlow
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );

    // Step 1: Select upload method
    const uploadMethodButton = screen.getByRole('button', { name: /upload csv/i });
    await user.click(uploadMethodButton);

    // Step 2: Upload CSV file
    const csvContent = `Date,Sales,Profit
2024-01-01,5000,1500
2024-01-02,5500,1650
2024-01-03,6000,1800
2024-01-04,5800,1740
2024-01-05,6200,1860`;

    const file = new File([csvContent], 'sales.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/choose.*file/i);

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Step 3: Preview should show
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
      expect(screen.getByText(/5 rows/i)).toBeInTheDocument();
      expect(screen.getByText(/3 columns/i)).toBeInTheDocument();
    });

    // Verify preview data
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Profit')).toBeInTheDocument();

    // Step 4: Confirm and analyze
    const confirmButton = screen.getByRole('button', { name: /confirm|next|analyze/i });
    await user.click(confirmButton);

    // Step 5: AI recommendations should appear
    await waitFor(() => {
      expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/line.*chart/i)).toBeInTheDocument();
    });

    // Verify multiple options
    expect(screen.getByText(/area/i)).toBeInTheDocument();
    expect(screen.getByText(/column/i)).toBeInTheDocument();

    // Step 6: Select a recommendation
    const selectButton = screen.getByRole('button', { name: /select|use.*line/i });
    await user.click(selectButton);

    // Step 7: Complete the flow
    const createButton = screen.getByRole('button', { name: /create|finish/i });
    await user.click(createButton);

    // Verify completion
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
      const tileData = onComplete.mock.calls[0][0];
      expect(tileData).toHaveProperty('title');
      expect(tileData).toHaveProperty('type', 'line');
      expect(tileData).toHaveProperty('data');
      expect(tileData).toHaveProperty('config');
    });
  });

  it('should handle large CSV files correctly', async () => {
    const onComplete = jest.fn();
    const onCancel = jest.fn();

    render(
      <DataImportFlow
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );

    // Generate large CSV (1000 rows)
    let largeCsvContent = 'ID,Value,Category\n';
    for (let i = 1; i <= 1000; i++) {
      largeCsvContent += `${i},${Math.random() * 1000},Category${i % 5}\n`;
    }

    const file = new File([largeCsvContent], 'large.csv', { type: 'text/csv' });

    const uploadMethodButton = screen.getByRole('button', { name: /upload csv/i });
    await userEvent.click(uploadMethodButton);

    const fileInput = screen.getByLabelText(/choose.*file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should show progress indicator for large file
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    // Should complete and show preview
    await waitFor(() => {
      expect(screen.getByText(/1000 rows/i)).toBeInTheDocument();
      expect(screen.getByText(/preview.*10 rows/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should validate CSV structure and show errors', async () => {
    const onComplete = jest.fn();
    const onCancel = jest.fn();

    render(
      <DataImportFlow
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );

    // Malformed CSV with inconsistent columns
    const malformedCsv = `Name,Age,Score
John,25,85
Jane,30
Bob,28,90,Extra`;

    const file = new File([malformedCsv], 'malformed.csv', { type: 'text/csv' });

    const uploadMethodButton = screen.getByRole('button', { name: /upload csv/i });
    await userEvent.click(uploadMethodButton);

    const fileInput = screen.getByLabelText(/choose.*file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/error|warning/i)).toBeInTheDocument();
      expect(screen.getByText(/inconsistent.*columns/i)).toBeInTheDocument();
    });

    // Should show which rows have issues
    expect(screen.getByText(/row.*2/i)).toBeInTheDocument();
  });

  it('should persist dataset and allow reuse', async () => {
    const onComplete = jest.fn();
    const onCancel = jest.fn();

    const { rerender } = render(
      <DataImportFlow
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );

    // Upload and complete flow
    const csvContent = 'Test,Data\n1,100\n2,200';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const uploadMethodButton = screen.getByRole('button', { name: /upload csv/i });
    await userEvent.click(uploadMethodButton);

    const fileInput = screen.getByLabelText(/choose.*file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm|next/i });
    await userEvent.click(confirmButton);

    // Complete the flow
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create|finish/i });
      userEvent.click(createButton);
    });

    // Remount component
    rerender(
      <DataImportFlow
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );

    // Should show saved datasets option
    const savedDatasetsTab = screen.getByRole('tab', { name: /saved|my datasets/i });
    await userEvent.click(savedDatasetsTab);

    // Should list the previously uploaded dataset
    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
  });

  it('should handle Chart-MCP service errors gracefully', async () => {
    // Mock Chart-MCP failure
    const chartMCP = require('@/lib/services/chartMCP').chartMCPService;
    chartMCP.generateCharts.mockRejectedValueOnce(new Error('Service unavailable'));

    const onComplete = jest.fn();
    const onCancel = jest.fn();

    render(
      <DataImportFlow
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );

    // Upload CSV
    const csvContent = 'A,B\n1,2\n3,4';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const uploadMethodButton = screen.getByRole('button', { name: /upload csv/i });
    await userEvent.click(uploadMethodButton);

    const fileInput = screen.getByLabelText(/choose.*file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Continue to recommendations
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm|next/i });
      userEvent.click(confirmButton);
    });

    // Should show fallback recommendations
    await waitFor(() => {
      expect(screen.getByText(/basic.*recommendations/i)).toBeInTheDocument();
      // Should still show chart options based on data type analysis
      expect(screen.getByText(/bar|column/i)).toBeInTheDocument();
    });
  });
});