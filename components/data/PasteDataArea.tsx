import { useState } from 'react';
import { ClipboardPaste, ArrowLeft, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PasteDataAreaProps {
  onDataPaste: (data: string) => void;
  onBack: () => void;
  isProcessing?: boolean;
  error?: string | null;
}

const SAMPLE_DATA = `Date,Product,Sales,Region
2024-01-01,Widget A,1500,North
2024-01-02,Widget B,2300,South
2024-01-03,Widget A,1800,East
2024-01-04,Widget C,3200,West
2024-01-05,Widget B,2100,North`;

export default function PasteDataArea({
  onDataPaste,
  onBack,
  isProcessing = false,
  error = null
}: PasteDataAreaProps) {
  const [pastedData, setPastedData] = useState('');
  const [showExample, setShowExample] = useState(false);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    setPastedData(text);
  };

  const handleProcess = () => {
    if (pastedData.trim() && !isProcessing) {
      onDataPaste(pastedData);
    }
  };

  const handleUseSample = () => {
    setPastedData(SAMPLE_DATA);
  };

  const handleClear = () => {
    setPastedData('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Paste Your Data</h3>
        <p className="text-sm text-muted-foreground">
          Copy data from Excel, Google Sheets, or any spreadsheet and paste it below.
          We'll automatically detect the format and structure.
        </p>
      </div>

      {/* Instructions */}
      <Alert className="bg-blue-50 border-blue-200">
        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">How to paste from spreadsheets:</AlertTitle>
        <AlertDescription className="text-blue-700 space-y-2 mt-2">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select your data in Excel or Google Sheets (include headers)</li>
            <li>Copy the selection (Ctrl+C or Cmd+C)</li>
            <li>Click in the text area below and paste (Ctrl+V or Cmd+V)</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Paste Area with Tabs */}
      <Tabs defaultValue="paste" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste">Paste Data</TabsTrigger>
          <TabsTrigger value="example">See Example</TabsTrigger>
        </TabsList>
        
        <TabsContent value="paste" className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Paste your data here...&#10;&#10;Tip: Make sure to include column headers in the first row"
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              onPaste={handlePaste}
              className="min-h-[300px] font-mono text-sm"
              disabled={isProcessing}
            />
            
            {!pastedData && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground">
                  <ClipboardPaste className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Paste your data here</p>
                </div>
              </div>
            )}
          </div>
          
          {pastedData && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isProcessing}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseSample}
                disabled={isProcessing}
              >
                Use Sample Data
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="example" className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Example CSV Data:</p>
            <pre className="text-xs font-mono whitespace-pre-wrap">{SAMPLE_DATA}</pre>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              handleUseSample();
              // Switch back to paste tab
              const pasteTab = document.querySelector('[value="paste"]') as HTMLButtonElement;
              pasteTab?.click();
            }}
            disabled={isProcessing}
          >
            Use This Example
          </Button>
        </TabsContent>
      </Tabs>

      {/* Data Preview */}
      {pastedData && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Data Preview:</p>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              {pastedData.split('\n').length} rows detected
            </p>
            <p className="text-xs text-muted-foreground">
              {pastedData.split('\n')[0]?.split(/[,\t]/).length || 0} columns detected
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
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
          onClick={handleProcess}
          disabled={!pastedData.trim() || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              Processing...
            </>
          ) : (
            <>
              Process Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
}