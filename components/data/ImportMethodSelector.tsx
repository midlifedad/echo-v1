import { Upload, ClipboardPaste, Link, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ImportMethod } from '@/lib/types/dataImport';

interface ImportMethodSelectorProps {
  onSelect: (method: ImportMethod) => void;
  onCancel: () => void;
}

const IMPORT_METHODS = [
  {
    id: 'file' as ImportMethod,
    title: 'Upload File',
    description: 'Upload a CSV, TSV, or Excel file from your computer',
    icon: Upload,
    available: true,
    supportedFormats: ['CSV', 'TSV', 'XLSX', 'XLS']
  },
  {
    id: 'paste' as ImportMethod,
    title: 'Paste Data',
    description: 'Paste data directly from Excel, Google Sheets, or any spreadsheet',
    icon: ClipboardPaste,
    available: true,
    supportedFormats: ['Tab-delimited', 'Comma-separated']
  },
  {
    id: 'url' as ImportMethod,
    title: 'From URL',
    description: 'Import data from a public URL or API endpoint',
    icon: Link,
    available: false,
    supportedFormats: ['CSV', 'JSON', 'API']
  },
  {
    id: 'connection' as ImportMethod,
    title: 'Connect Source',
    description: 'Connect to a database or data service',
    icon: Database,
    available: false,
    supportedFormats: ['MySQL', 'PostgreSQL', 'BigQuery']
  }
];

export default function ImportMethodSelector({ onSelect, onCancel }: ImportMethodSelectorProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Import Your Data</h2>
        <p className="text-muted-foreground">
          Choose how you&apos;d like to import your data. We&apos;ll help you transform it into beautiful visualizations.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {IMPORT_METHODS.map((method) => {
          const Icon = method.icon;
          
          return (
            <Card
              key={method.id}
              className={`relative transition-all cursor-pointer hover:shadow-md ${
                method.available 
                  ? 'hover:border-primary' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => method.available && onSelect(method.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  {!method.available && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
                <CardDescription className="text-sm">
                  {method.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Supports:</span>{' '}
                  {method.supportedFormats.join(', ')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}