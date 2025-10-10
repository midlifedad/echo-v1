/**
 * Integration Test: AI Recommendation Selection Workflow
 * Tests Chart-MCP integration and recommendation UI
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import ChartRecommendations from '@/components/charts/ChartRecommendations';
import { chartMCPService } from '@/lib/services/chartMCP';

// Mock the Chart-MCP service
jest.mock('@/lib/services/chartMCP', () => ({
  chartMCPService: {
    generateCharts: jest.fn(),
    testConnection: jest.fn()
  }
}));

describe('AI Chart Recommendation Selection Integration', () => {
  const user = userEvent.setup();
  const mockDataset = {
    id: 'test-123',
    name: 'Sales Data',
    data: [
      ['Month', 'Revenue', 'Expenses'],
      ['Jan', 50000, 35000],
      ['Feb', 55000, 37000],
      ['Mar', 61000, 39000]
    ],
    columns: [
      { name: 'Month', dataType: 'string' },
      { name: 'Revenue', dataType: 'number' },
      { name: 'Expenses', dataType: 'number' }
    ],
    rowCount: 3,
    columnCount: 3
  };

  beforeAll(() => {
    // Mock successful Chart-MCP connection
    (chartMCPService.testConnection as jest.Mock).mockResolvedValue(true);
  });

  it('should display AI recommendations and allow selection', async () => {
    const onSelect = jest.fn();
    const onCancel = jest.fn();

    // Mock Chart-MCP response
    (chartMCPService.generateCharts as jest.Mock).mockResolvedValue({
      recommended: {
        id: 'rec-1',
        chartType: 'column',
        confidence: 0.95,
        rationale: 'Column chart best for comparing monthly values',
        config: {
          title: { text: 'Monthly Revenue vs Expenses' },
          xAxis: { categories: ['Jan', 'Feb', 'Mar'] },
          series: [
            { name: 'Revenue', data: [50000, 55000, 61000] },
            { name: 'Expenses', data: [35000, 37000, 39000] }
          ]
        }
      },
      alternatives: [
        {
          id: 'alt-1',
          chartType: 'line',
          confidence: 0.85,
          rationale: 'Line chart shows trends over time'
        },
        {
          id: 'alt-2',
          chartType: 'area',
          confidence: 0.75,
          rationale: 'Area chart emphasizes magnitude'
        }
      ]
    });

    render(
      <ChartRecommendations
        dataset={mockDataset}
        onSelect={onSelect}
        onCancel={onCancel}
      />
    );

    // Should show loading state initially
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();

    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
    });

    // Verify primary recommendation is displayed
    expect(screen.getByText(/column.*chart/i)).toBeInTheDocument();
    expect(screen.getByText(/95%.*confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/comparing monthly values/i)).toBeInTheDocument();

    // Verify alternatives are shown
    expect(screen.getByText(/line.*chart/i)).toBeInTheDocument();
    expect(screen.getByText(/area.*chart/i)).toBeInTheDocument();

    // Select primary recommendation
    const selectButton = screen.getByRole('button', { name: /use.*column/i });
    await user.click(selectButton);

    // Verify selection callback
    expect(onSelect).toHaveBeenCalledWith({
      chartType: 'column',
      config: expect.objectContaining({
        title: { text: 'Monthly Revenue vs Expenses' }
      }),
      dataset: mockDataset
    });
  });

  it('should handle natural language intent input', async () => {
    const onSelect = jest.fn();
    const onCancel = jest.fn();

    render(
      <ChartRecommendations
        dataset={mockDataset}
        onSelect={onSelect}
        onCancel={onCancel}
        allowIntent={true}
      />
    );

    // Find and fill intent input
    const intentInput = screen.getByPlaceholderText(/describe.*visualization/i);
    await user.type(intentInput, 'Show profit margin trends with emphasis on growth');

    const analyzeButton = screen.getByRole('button', { name: /analyze/i });
    await user.click(analyzeButton);

    // Verify Chart-MCP was called with intent
    await waitFor(() => {
      expect(chartMCPService.generateCharts).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockDataset.data,
          intent: 'Show profit margin trends with emphasis on growth'
        })
      );
    });
  });

  it('should switch between recommendation options', async () => {
    const onSelect = jest.fn();

    (chartMCPService.generateCharts as jest.Mock).mockResolvedValue({
      recommended: {
        id: 'rec-1',
        chartType: 'column',
        confidence: 0.95,
        config: { /* column config */ }
      },
      alternatives: [
        {
          id: 'alt-1',
          chartType: 'line',
          confidence: 0.85,
          config: { /* line config */ }
        }
      ]
    });

    render(
      <ChartRecommendations
        dataset={mockDataset}
        onSelect={onSelect}
        onCancel={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
    });

    // Click on alternative recommendation
    const lineOption = screen.getByRole('button', { name: /view.*line/i });
    await user.click(lineOption);

    // Verify preview updates
    await waitFor(() => {
      expect(screen.getByText(/line.*chart.*preview/i)).toBeInTheDocument();
    });

    // Select the alternative
    const selectAltButton = screen.getByRole('button', { name: /use.*line/i });
    await user.click(selectAltButton);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        chartType: 'line'
      })
    );
  });

  it('should handle Chart-MCP service errors gracefully', async () => {
    const onSelect = jest.fn();
    const onCancel = jest.fn();

    // Mock service failure
    (chartMCPService.generateCharts as jest.Mock).mockRejectedValue(
      new Error('Chart-MCP service unavailable')
    );

    render(
      <ChartRecommendations
        dataset={mockDataset}
        onSelect={onSelect}
        onCancel={onCancel}
      />
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });

    // Should show fallback options
    expect(screen.getByText(/basic.*charts/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bar.*chart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /line.*chart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pie.*chart/i })).toBeInTheDocument();

    // Can still select fallback option
    const barButton = screen.getByRole('button', { name: /bar.*chart/i });
    await user.click(barButton);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        chartType: 'bar',
        isFallback: true
      })
    );
  });

  it('should show confidence indicators and rationale', async () => {
    (chartMCPService.generateCharts as jest.Mock).mockResolvedValue({
      recommended: {
        id: 'rec-1',
        chartType: 'scatter',
        confidence: 0.92,
        rationale: 'Scatter plot reveals correlation between revenue and expenses',
        insights: [
          'Strong positive correlation (r=0.89)',
          'One outlier in February data',
          'Linear trend line recommended'
        ],
        config: {}
      },
      alternatives: []
    });

    render(
      <ChartRecommendations
        dataset={mockDataset}
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/scatter/i)).toBeInTheDocument();
    });

    // Verify confidence display
    expect(screen.getByText(/92%/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '92');

    // Verify rationale
    expect(screen.getByText(/correlation between revenue and expenses/i)).toBeInTheDocument();

    // Verify insights if shown
    expect(screen.getByText(/Strong positive correlation/i)).toBeInTheDocument();
    expect(screen.getByText(/outlier.*February/i)).toBeInTheDocument();
  });

  it('should allow customization after recommendation', async () => {
    const onSelect = jest.fn();

    (chartMCPService.generateCharts as jest.Mock).mockResolvedValue({
      recommended: {
        id: 'rec-1',
        chartType: 'column',
        confidence: 0.95,
        config: {
          title: { text: 'Monthly Data' },
          colors: ['#1f77b4', '#ff7f0e']
        }
      },
      alternatives: []
    });

    render(
      <ChartRecommendations
        dataset={mockDataset}
        onSelect={onSelect}
        onCancel={jest.fn()}
        allowCustomization={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/recommendations/i)).toBeInTheDocument();
    });

    // Click customize button
    const customizeButton = screen.getByRole('button', { name: /customize/i });
    await user.click(customizeButton);

    // Customization panel should appear
    expect(screen.getByText(/chart.*settings/i)).toBeInTheDocument();

    // Modify title
    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Q1 Financial Overview');

    // Apply customizations
    const applyButton = screen.getByRole('button', { name: /apply/i });
    await user.click(applyButton);

    // Select customized chart
    const selectButton = screen.getByRole('button', { name: /use.*chart/i });
    await user.click(selectButton);

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          title: { text: 'Q1 Financial Overview' }
        })
      })
    );
  });

  it('should handle large datasets with sampling', async () => {
    // Generate large dataset
    const largeData = [['Index', 'Value']];
    for (let i = 0; i < 10000; i++) {
      largeData.push([i, Math.random() * 1000]);
    }

    const largeDataset = {
      ...mockDataset,
      data: largeData,
      rowCount: 10000
    };

    render(
      <ChartRecommendations
        dataset={largeDataset}
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Should show sampling notice
    await waitFor(() => {
      expect(screen.getByText(/sampling.*performance/i)).toBeInTheDocument();
    });

    // Verify Chart-MCP receives sampled data
    await waitFor(() => {
      expect(chartMCPService.generateCharts).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          metadata: expect.objectContaining({
            totalRows: 10000,
            sampledRows: expect.any(Number)
          })
        })
      );
    });
  });
});