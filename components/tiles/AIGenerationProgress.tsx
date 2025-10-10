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
  { name: 'beautifier', label: 'Beautifying Charts', estimatedMs: 5000 },
];

export function AIGenerationProgress({ className }: AIGenerationProgressProps) {
  const [stages, setStages] = useState<Map<string, StageInfo>>(
    new Map(STAGES.map(s => [s.name, { name: s.name, label: s.label, status: 'pending' }]))
  );
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mockProgressIntervals, setMockProgressIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [stageStartTimes, setStageStartTimes] = useState<Map<string, number>>(new Map());
  const [elapsedTime, setElapsedTime] = useState<Map<string, number>>(new Map());

  // Start mock progress simulation for a stage
  const startMockProgress = (stageName: string) => {
    const stageConfig = STAGES.find(s => s.name === stageName);
    if (!stageConfig) return;

    console.log(`[AIGenerationProgress] 🎭 Starting mock progress for ${stageName}`);

    // Clear any existing interval for this stage
    const existingInterval = mockProgressIntervals.get(stageName);
    if (existingInterval) clearInterval(existingInterval);

    let progress = 0;
    const updateInterval = 200; // Update every 200ms
    const totalUpdates = stageConfig.estimatedMs / updateInterval;
    const incrementPerUpdate = 100 / totalUpdates;

    const interval = setInterval(() => {
      progress += incrementPerUpdate;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setMockProgressIntervals(prev => {
          const next = new Map(prev);
          next.delete(stageName);
          return next;
        });
      }

      setStages(prev => {
        const next = new Map(prev);
        const stage = next.get(stageName);
        if (stage && stage.status === 'running') {
          stage.progress = {
            current: Math.floor(progress),
            total: 100,
          };
        }
        return next;
      });
    }, updateInterval);

    setMockProgressIntervals(prev => {
      const next = new Map(prev);
      next.set(stageName, interval);
      return next;
    });
  };

  // Stop mock progress for a stage
  const stopMockProgress = (stageName: string) => {
    const interval = mockProgressIntervals.get(stageName);
    if (interval) {
      console.log(`[AIGenerationProgress] 🛑 Stopping mock progress for ${stageName}`);
      clearInterval(interval);
      setMockProgressIntervals(prev => {
        const next = new Map(prev);
        next.delete(stageName);
        return next;
      });
    }
  };

  const handleStageEvent = (event: StageEvent) => {
    // Debug logging
    console.log('[AIGenerationProgress] Received event:', {
      type: event.type,
      stage: event.stage,
      data: event.data,
      metadata: event.metadata,
      timestamp: new Date(event.timestamp).toISOString()
    });

    if (event.type === 'stage:start') {
      console.log(`[AIGenerationProgress] Starting stage: ${event.stage}`);
      const now = Date.now();
      if (!startTime) setStartTime(now);

      // Track stage start time for elapsed display
      setStageStartTimes(prev => {
        const next = new Map(prev);
        next.set(event.stage, now);
        return next;
      });

      setStages(prev => {
        const next = new Map(prev);
        const stage = next.get(event.stage);
        if (stage) {
          // IMPORTANT: Create new object for immutable update
          const updatedStage = {
            ...stage,
            status: 'running' as const,
            progress: event.data?.total
              ? { current: 0, total: event.data.total }
              : { current: 0, total: 100 }
          };
          next.set(event.stage, updatedStage);

          // Start mock progress only if no server progress data
          if (!event.data?.total) {
            startMockProgress(event.stage);
          }
        } else {
          console.warn(`[AIGenerationProgress] Unknown stage: ${event.stage}`);
        }
        return next;
      });
      setCurrentStage(event.stage);
    } else if (event.type === 'stage:progress') {
      // Real progress from server, stop mock and use real data
      stopMockProgress(event.stage);
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
      const duration = event.metadata?.duration;
      console.log(`[AIGenerationProgress] 🏁 Stage complete: ${event.stage}`, {
        durationMs: duration,
        durationSec: duration !== undefined ? (duration / 1000).toFixed(1) + 's' : 'undefined',
        hasMetadata: !!event.metadata,
        fullEvent: event
      });
      stopMockProgress(event.stage);
      setStages(prev => {
        const next = new Map(prev);
        const stage = next.get(event.stage);
        if (stage) {
          // IMPORTANT: Create new object for immutable update
          const updatedStage = {
            ...stage,
            status: 'complete' as const,
            duration: duration,
            progress: stage.progress ? {
              ...stage.progress,
              current: stage.progress.total
            } : undefined
          };
          next.set(event.stage, updatedStage);
          console.log(`[AIGenerationProgress] ✅ Updated stage ${event.stage}:`, updatedStage);
        }
        return next;
      });
    } else if (event.type === 'stage:error') {
      console.error(`[AIGenerationProgress] Stage error: ${event.stage}`, event.data?.error);
      stopMockProgress(event.stage);
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
      console.log('[AIGenerationProgress] 🎉 Pipeline complete!', event);
      // Clear all mock progress intervals
      mockProgressIntervals.forEach((interval, stageName) => {
        clearInterval(interval);
      });
      setMockProgressIntervals(new Map());

      // Get total time from MCP diagnostics (most reliable source)
      const totalDuration = event.data?.diagnostics?.timings?.totalMs || 0;

      setTotalTime(totalDuration);
      console.log(`[AIGenerationProgress] 📊 Total time from MCP:`, {
        totalMs: totalDuration,
        totalSec: (totalDuration / 1000).toFixed(1) + 's',
        diagnostics: event.data?.diagnostics,
        stageDurationsFromState: Array.from(stages.values()).map(s => ({
          name: s.name,
          duration: s.duration,
          durationSec: s.duration !== undefined ? (s.duration / 1000).toFixed(1) + 's' : 'N/A'
        }))
      });
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

  // Real-time elapsed time updater for running stages
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedTime(prev => {
        const next = new Map(prev);
        stageStartTimes.forEach((startTime, stageName) => {
          const stage = stages.get(stageName);
          if (stage?.status === 'running') {
            next.set(stageName, now - startTime);
          }
        });
        return next;
      });
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(interval);
  }, [stageStartTimes, stages]);

  // Cleanup: Clear all intervals on unmount
  useEffect(() => {
    return () => {
      console.log('[AIGenerationProgress] 🧹 Cleaning up mock progress intervals');
      mockProgressIntervals.forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [mockProgressIntervals]);

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
                  {stage.status === 'running' && elapsedTime.get(stage.name) !== undefined ? (
                    <span className="text-xs text-primary font-medium animate-pulse">
                      {((elapsedTime.get(stage.name) || 0) / 1000).toFixed(1)}s
                    </span>
                  ) : stage.duration !== undefined ? (
                    <span className="text-xs text-muted-foreground">
                      {(stage.duration / 1000).toFixed(1)}s
                    </span>
                  ) : null}
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