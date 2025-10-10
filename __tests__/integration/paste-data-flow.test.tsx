/**
 * Integration Test: Paste Data Workflow
 * Tests pasting data from Excel/Google Sheets
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import DataImportFlow from '@/components/data/DataImportFlow';

describe('Paste Data Workflow Integration', () => {
  const user = userEvent.setup();

  it('should handle pasted tab-separated data from Excel', async () => {
    const onComplete = jest.fn();
    const onCancel = jest.fn();

    render(
      <DataImportFlow
        onComplete={onComplete}
        onCancel={onCancel}
      />
    );

    // Select paste method
    const pasteMethodButton = screen.getByRole('button', { name: /paste.*data/i });
    await user.click(pasteMethodButton);

    // Tab-separated data (Excel format)
    const excelData = `Product\tQ1\tQ2\tQ3\tQ4
Widget A\t1200\t1350\t1500\t1400
Widget B\t800\t950\t1100\t1250
Widget C\t450\t500\t550\t600`;

    const pasteArea = screen.getByRole('textbox', { name: /paste.*data/i });
    await user.type(pasteArea, excelData);

    const analyzeButton = screen.getByRole('button', { name: /analyze|process/i });
    await user.click(analyzeButton);

    // Should detect tab delimiter and parse correctly
    await waitFor(() => {
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Widget A')).toBeInTheDocument();
      expect(screen.getByText(/4 rows.*5 columns/i)).toBeInTheDocument();
    });
  });

  it('should auto-detect various delimiters', async () => {
    const testCases = [
      { data: 'A,B,C\n1,2,3', delimiter: 'comma' },
      { data: 'A\tB\tC\n1\t2\t3', delimiter: 'tab' },
      { data: 'A;B;C\n1;2;3', delimiter: 'semicolon' },
      { data: 'A|B|C\n1|2|3', delimiter: 'pipe' }
    ];

    for (const testCase of testCases) {
      const { rerender } = render(
        <DataImportFlow
          onComplete={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      const pasteMethodButton = screen.getByRole('button', { name: /paste.*data/i });
      await user.click(pasteMethodButton);

      const pasteArea = screen.getByRole('textbox', { name: /paste.*data/i });
      await user.clear(pasteArea);
      await user.type(pasteArea, testCase.data);

      const analyzeButton = screen.getByRole('button', { name: /analyze|process/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('C')).toBeInTheDocument();
      });

      rerender(<></>); // Clean up for next iteration
    }
  });
});