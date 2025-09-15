import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Upload, FileText, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import ImportMethodSelector from './ImportMethodSelector';
import FileUploadZone from './FileUploadZone';
import PasteDataArea from './PasteDataArea';
import DataPreview from './DataPreview';
import ColumnMappingPanel from './ColumnMappingPanel';
import { ColumnMapper } from '@/lib/services/columnMapper';
import { csvParser } from '@/lib/services/csvParser';
import { dataImportService } from '@/lib/services/dataImportService';
import type { 
  ImportMethod, 
  ParsedData, 
  ColumnAnalysis, 
  DataProfile,
  ChartRecommendation 
} from '@/lib/types/dataImport';

interface DataImportFlowProps {
  onComplete: (tileData: any) => void;
  onCancel: () => void;
}

type ImportStep = 'method' | 'input' | 'preview' | 'mapping' | 'complete';

const STEPS: { id: ImportStep; label: string; icon: any }[] = [
  { id: 'method', label: 'Choose Method', icon: Upload },
  { id: 'input', label: 'Import Data', icon: FileText },
  { id: 'preview', label: 'Preview', icon: FileText },
  { id: 'mapping', label: 'Map Columns', icon: Check },
  { id: 'complete', label: 'Complete', icon: Check },
];

export default function DataImportFlow({ onComplete, onCancel }: DataImportFlowProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('method');
  const [importMethod, setImportMethod] = useState<ImportMethod | null>(null);
  const [rawData, setRawData] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartRecommendation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columnMapper = new ColumnMapper();

  const getStepIndex = (step: ImportStep) => {
    return STEPS.findIndex(s => s.id === step);
  };

  const progressPercentage = ((getStepIndex(currentStep) + 1) / STEPS.length) * 100;

  const handleMethodSelect = (method: ImportMethod) => {
    setImportMethod(method);
    setCurrentStep('input');
    setError(null);
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const text = await file.text();
      setRawData(text);
      
      // Parse the CSV data
      const parsed = await csvParser.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      if (parsed.errors.length > 0) {
        setError(`Parse errors: ${parsed.errors.map(e => e.message).join(', ')}`);
        return;
      }
      
      setParsedData(parsed);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteData = async (data: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      setRawData(data);
      
      // Auto-detect delimiter and parse
      const parsed = await csvParser.parse(data, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimiter: csvParser.detectDelimiter(data)
      });
      
      if (parsed.errors.length > 0) {
        setError(`Parse errors: ${parsed.errors.map(e => e.message).join(', ')}`);
        return;
      }
      
      setParsedData(parsed);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreviewConfirm = async () => {
    if (!parsedData) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Analyze the data with ColumnMapper
      const profile = columnMapper.analyzeDataset(
        parsedData.meta.fields || [],
        parsedData.data
      );
      
      setDataProfile(profile);
      
      // Auto-select the first recommended chart
      if (profile.chartRecommendations.length > 0) {
        setSelectedChart(profile.chartRecommendations[0]);
      }
      
      setCurrentStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingComplete = async (chartConfig: ChartRecommendation) => {
    if (!parsedData || !dataProfile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Generate tile configuration from the imported data
      const tileData = await dataImportService.generateTileFromData({
        parsedData,
        dataProfile,
        chartConfig,
        importMethod: importMethod!
      });
      
      setCurrentStep('complete');
      
      // Small delay for user feedback
      setTimeout(() => {
        onComplete(tileData);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tile');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
      setError(null);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'method':
        return (
          <ImportMethodSelector 
            onSelect={handleMethodSelect}
            onCancel={onCancel}
          />
        );
      
      case 'input':
        if (importMethod === 'file') {
          return (
            <FileUploadZone
              onFileSelect={handleFileUpload}
              onBack={handleBack}
              isProcessing={isProcessing}
              error={error}
            />
          );
        } else if (importMethod === 'paste') {
          return (
            <PasteDataArea
              onDataPaste={handlePasteData}
              onBack={handleBack}
              isProcessing={isProcessing}
              error={error}
            />
          );
        }
        return null;
      
      case 'preview':
        return parsedData ? (
          <DataPreview
            data={parsedData}
            onConfirm={handlePreviewConfirm}
            onBack={handleBack}
            isProcessing={isProcessing}
            error={error}
          />
        ) : null;
      
      case 'mapping':
        return dataProfile ? (
          <ColumnMappingPanel
            dataProfile={dataProfile}
            parsedData={parsedData!}
            selectedChart={selectedChart}
            onChartSelect={setSelectedChart}
            onConfirm={handleMappingComplete}
            onBack={handleBack}
            isProcessing={isProcessing}
            error={error}
          />
        ) : null;
      
      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Import Complete!</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Your data has been successfully imported and a new chart tile has been created.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="px-6 pt-6 pb-4 border-b">
        <div className="space-y-4">
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isComplete = getStepIndex(step.id) < getStepIndex(currentStep);
              const Icon = step.icon;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center space-y-2",
                    isActive ? "text-primary" : isComplete ? "text-primary/60" : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full p-2 transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : 
                      isComplete ? "bg-primary/20" : "bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="flex-1 overflow-auto">
        {renderStepContent()}
      </div>
    </div>
  );
}