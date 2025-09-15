import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { validateFileFormat, validateFileSize } from '@/lib/utils/securityValidation';
import { DATA_IMPORT_CONFIG } from '@/lib/config/dataImportConfig';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  onBack: () => void;
  isProcessing?: boolean;
  error?: string | null;
}

export default function FileUploadZone({
  onFileSelect,
  onBack,
  isProcessing = false,
  error = null
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Reset validation error
    setValidationError(null);
    
    // Validate file format
    const formatValidation = validateFileFormat(file.name);
    if (!formatValidation.isValid) {
      setValidationError(formatValidation.reason || 'Invalid file format');
      return false;
    }
    
    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.isValid) {
      setValidationError(sizeValidation.reason || 'File too large');
      return false;
    }
    
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setValidationError(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile && !isProcessing) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Upload Data File</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV, TSV, or Excel file containing your data. Maximum file size is{' '}
          {formatFileSize(DATA_IMPORT_CONFIG.fileHandling.maxFileSize)}.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          selectedFile ? "bg-muted/50" : "",
          isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.tsv,.txt,.xlsx,.xls"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />
        
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">
                {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse your files
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Supported formats: CSV, TSV, XLSX, XLS
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(validationError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationError || error}
          </AlertDescription>
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
          onClick={handleUploadClick}
          disabled={!selectedFile || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process File
            </>
          )}
        </Button>
      </div>
    </div>
  );
}