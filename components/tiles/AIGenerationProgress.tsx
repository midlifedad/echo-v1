'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Check, X, ChevronRight } from 'lucide-react';
import type { StageEvent } from '@/lib/services/chartMCP';

interface AIGenerationProgressProps {
  className?: string;
}

interface StageInfo {
  name: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
  progress?: {
    current: number;
    total: number;
  };
  error?: string;
}

const STAGES: Array<{ name: string; label: string; estimatedMs: number }> = [
  { name: 'planner', label: 'Planning Options', estimatedMs: 25000 },
  { name: 'compiler', label: 'Compiling Charts', estimatedMs: 10000 },
  { name: 'renderer', label: 'Rendering Previews', estimatedMs: 3000 },
  { name: 'ranker', label: 'Ranking Results', estimatedMs: 7000 },
];

export function AIGenerationProgress({ className }: AIGenerationProgressProps) {
  const [stages, setStages] = useState<Map<string, StageInfo>>(
    new Map(STAGES.map(s => [s.name, { name: s.name, label: s.label, status: 'pending' }]))
  );
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const handleStageEvent = (event: StageEvent) => {
    if (event.type === 'stage:start') {
      if (!startTime) setStartTime(Date.now());
      
      setStages(prev => {
        const next = new Map(prev);
        const stage = next.get(event.stage);
        if (stage) {
          stage.status = 'running';
          if (event.data?.total) {
            stage.progress = { current: 0, total: event.data.total };
          }
        }
        return next;
      });
      setCurrentStage(event.stage);
    } else if (event.type === 'stage:progress') {
      setStages(prev => {
        const next = new Map(prev);
        const stage = next.get(event.stage);
        if (stage && event.data) {
          stage.progress = {
            current: event.data.completed || 0,
            total: event.data.total || 0,
          };
        }
        return next;
      });
    } else if (event.type === 'stage:complete') {
      setStages(prev => {
        const next = new Map(prev);
        const stage = next.get(event.stage);
        if (stage) {
          stage.status = 'complete';
          stage.duration = event.metadata?.duration;
        }
        return next;
      });
    } else if (event.type === 'stage:error') {
      setStages(prev => {
        const next = new Map(prev);
        const stage = next.get(event.stage);
        if (stage) {
          stage.status = 'error';
          stage.error = event.data?.error;
        }
        return next;
      });
    } else if (event.type === 'pipeline:complete') {
      if (startTime) {
        setTotalTime(Date.now() - startTime);
      }
      setCurrentStage(null);
    }
  };

  // Subscribe to stage events (would be passed from parent in real implementation)
  useEffect(() => {
    // This will be connected to the WebSocket events from the parent component
    (window as any).__aiGenerationProgress = handleStageEvent;
    return () => {
      delete (window as any).__aiGenerationProgress;
    };
  }, [startTime]);

  const getStageIcon = (status: StageInfo['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'complete':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-3">
        {Array.from(stages.values()).map((stage, index) => (
          <div key={stage.name} className="relative">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all",
              stage.status === 'running' && "bg-primary/10 border border-primary/20",
              stage.status === 'complete' && "bg-green-500/10",
              stage.status === 'error' && "bg-red-500/10",
              stage.status === 'pending' && "opacity-50"
            )}>
              {getStageIcon(stage.status)}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{stage.label}</span>
                  {stage.duration && (
                    <span className="text-xs text-muted-foreground">
                      {(stage.duration / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                
                {stage.progress && stage.status === 'running' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{stage.progress.current} / {stage.progress.total}</span>
                      <span>{Math.round((stage.progress.current / stage.progress.total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(stage.progress.current / stage.progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {stage.error && (
                  <p className="text-xs text-red-500 mt-1">{stage.error}</p>
                )}
              </div>
            </div>
            
            {index < stages.size - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
            )}
          </div>
        ))}
      </div>
      
      {totalTime > 0 && (
        <div className="pt-3 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Total time: {(totalTime / 1000).toFixed(1)} seconds
          </p>
        </div>
      )}
    </div>
  );
}