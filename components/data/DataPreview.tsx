import { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { sanitizeUserInput, sanitizeText } from '@/lib/utils/domSanitizer';
import type { ParsedData } from '@/lib/types/dataImport';

interface DataPreviewProps {
  data: ParsedData;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing?: boolean;
  error?: string | null;
}

export default function DataPreview({
  data,
  onConfirm,
  onBack,
  isProcessing = false,
  error = null
}: DataPreviewProps) {
  const [previewRows] = useState(10);
  
  const headers = data.meta.fields || [];
  const rows = data.data.slice(0, previewRows);
  const totalRows = data.data.length;
  const totalColumns = headers.length;
  
  // Calculate basic statistics
  const nullCounts = headers.reduce((acc, header) => {
    acc[header] = data.data.filter(row => 
      row[header] === null || row[header] === undefined || row[header] === ''
    ).length;
    return acc;
  }, {} as Record<string, number>);
  
  const getCompleteness = (header: string) => {
    const nullCount = nullCounts[header] || 0;
    return Math.round(((totalRows - nullCount) / totalRows) * 100);
  };
  
  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return value.toLocaleString();
    if (value instanceof Date) return value.toLocaleDateString();
    return sanitizeUserInput(value);
  };
  
  const getDataType = (header: string): string => {
    const values = data.data.slice(0, 100).map(row => row[header])
      .filter(v => v !== null && v !== undefined && v !== '');
    
    if (values.length === 0) return 'empty';
    
    const types = new Set(values.map(v => typeof v));
    if (types.size === 1) {
      const type = Array.from(types)[0];
      if (type === 'number') return 'number';
      if (type === 'boolean') return 'boolean';
      if (type === 'string') {
        // Check if dates
        if (values.every(v => !isNaN(Date.parse(String(v))))) return 'date';
        return 'text';
      }
    }
    
    return 'mixed';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Data Preview</h3>
        <p className="text-sm text-muted-foreground">
          Review your data before proceeding. We&apos;ll analyze the columns and suggest the best way to visualize them.
        </p>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Rows</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{totalRows.toLocaleString()}</p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Columns</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{totalColumns}</p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Parse Errors</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{data.errors.length}</p>
        </div>
      </div>

      {/* Column Overview */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Column Overview</h4>
        <div className="flex flex-wrap gap-2">
          {headers.map((header) => {
            const dataType = getDataType(header);
            const completeness = getCompleteness(header);
            
            return (
              <div
                key={header}
                className="flex items-center space-x-2 bg-muted/50 rounded-md px-3 py-1.5"
              >
                <span className="text-sm font-medium">{sanitizeText(header)}</span>
                <Badge variant="outline" className="text-xs">
                  {dataType}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {completeness}% complete
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">
            Preview (first {previewRows} of {totalRows.toLocaleString()} rows)
          </h4>
        </div>
        
        <ScrollArea className="h-[300px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12 font-mono text-xs">#</TableHead>
                {headers.map((header) => (
                  <TableHead key={header} className="min-w-[120px]">
                    {sanitizeText(header)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  {headers.map((header) => (
                    <TableCell key={header} className="text-sm">
                      {formatCellValue(row[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Parse Errors */}
      {data.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Parse errors detected:</p>
              {data.errors.slice(0, 3).map((error, index) => (
                <p key={index} className="text-sm">
                  Row {error.row}: {error.message}
                </p>
              ))}
              {data.errors.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  ...and {data.errors.length - 3} more errors
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Custom Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={isProcessing || headers.length === 0}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              Continue to Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}