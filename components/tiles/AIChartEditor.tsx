'use client';

import { useState, useEffect } from 'react';
import { AIChartGenerator } from './AIChartGenerator';
import { AIGenerationProgress } from './AIGenerationProgress';
import { AIChartSelection } from './AIChartSelection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { chartMCPService, type ChartMCPRequest, type ChartMCPResponse, type ChartOption, type StageEvent } from '@/lib/services/chartMCP';

type GenerationState = 'prompt' | 'generating' | 'selection' | 'error';

interface AIChartEditorProps {
  onComplete: (chartConfig: any, metadata?: any) => void;
  onCancel?: () => void;
}

export function AIChartEditor({ onComplete, onCancel }: AIChartEditorProps) {
  const [state, setState] = useState<GenerationState>('prompt');
  const [response, setResponse] = useState<ChartMCPResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentRequest, setCurrentRequest] = useState<ChartMCPRequest | null>(null);

  const handleGenerate = async (request: ChartMCPRequest) => {
    setState('generating');
    setError(null);
    setCurrentRequest(request);

    try {
      // Set up progress handler
      const handleProgress = (event: StageEvent) => {
        // Forward to progress component
        if ((window as any).__aiGenerationProgress) {
          (window as any).__aiGenerationProgress(event);
        }
      };

      // Try WebSocket first, fallback to REST
      let result: ChartMCPResponse;
      
      try {
        result = await chartMCPService.generateChartsWithProgress(request, handleProgress);
      } catch (wsError) {
        console.warn('WebSocket failed, falling back to REST API:', wsError);
        result = await chartMCPService.generateCharts(request);
      }

      setResponse(result);
      setState('selection');
    } catch (err) {
      console.error('Chart generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate charts');
      setState('error');
    }
  };

  const handleSelectChart = (option: ChartOption) => {
    if (!option.config) {
      setError('Selected chart has no configuration');
      return;
    }

    // Extract title from the config if available
    const title = option.config.title?.text || 'AI Generated Chart';
    
    // Prepare metadata about the AI generation
    const metadata = {
      aiGenerated: true,
      prompt: currentRequest?.intent.description,
      selectedIndex: option.index,
      chartType: option.chartType,
      reason: option.reason,
      generatedAt: new Date().toISOString(),
      preferences: currentRequest?.preferences,
      constraints: currentRequest?.constraints,
      allOptions: response, // Store all options for potential future re-selection
    };

    // Pass the Highcharts config and metadata to parent
    onComplete(option.config, metadata);
  };

  const handleReset = () => {
    setState('prompt');
    setResponse(null);
    setError(null);
    setCurrentRequest(null);
  };

  return (
    <div className="space-y-4">
      {state === 'prompt' && (
        <>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">AI Chart Generator</h3>
            <p className="text-sm text-muted-foreground">
              Describe what you want to visualize and AI will create it for you
            </p>
          </div>
          <AIChartGenerator onGenerate={handleGenerate} />
        </>
      )}

      {state === 'generating' && (
        <>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Generating Charts</h3>
            <p className="text-sm text-muted-foreground">
              AI is creating visualization options for you...
            </p>
          </div>
          <AIGenerationProgress />
          <div className="text-center text-sm text-muted-foreground">
            This typically takes 40-60 seconds
          </div>
        </>
      )}

      {state === 'selection' && response && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Select Your Chart</h3>
              <p className="text-sm text-muted-foreground">
                Choose from the AI-generated options below
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Start Over
            </Button>
          </div>
          <AIChartSelection
            response={response}
            onSelect={handleSelectChart}
          />
        </>
      )}

      {state === 'error' && (
        <>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'An unexpected error occurred'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Try Again
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="ghost" className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}