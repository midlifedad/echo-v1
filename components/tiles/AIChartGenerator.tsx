'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Settings2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ChartMCPRequest } from '@/lib/services/chartMCP';

interface AIChartGeneratorProps {
  onGenerate: (request: ChartMCPRequest) => void;
  isGenerating?: boolean;
}

export function AIChartGenerator({ onGenerate, isGenerating = false }: AIChartGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Preferences
  const [audience, setAudience] = useState<'general' | 'exec' | 'technical'>('general');
  const [impressiveness, setImpressiveness] = useState<'clean' | 'bold' | 'stunning'>('clean');
  const [colorBlindSafe, setColorBlindSafe] = useState(false);
  const [performance, setPerformance] = useState<'quality' | 'speed'>('quality');
  
  // Constraints
  const [allowPies, setAllowPies] = useState(true);
  const [maxSeries, setMaxSeries] = useState(8);
  const [maxCategories, setMaxCategories] = useState(24);
  const [smallScreen, setSmallScreen] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    const request: ChartMCPRequest = {
      intent: {
        description: prompt,
        mode: 'intent-only',
      },
      preferences: {
        audience,
        impressiveness,
        colorBlindSafe,
        performance,
      },
      constraints: {
        allowPies,
        maxSeries,
        maxCategories,
        smallScreen,
      },
    };

    onGenerate(request);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai-prompt">Describe your visualization</Label>
        <Textarea
          id="ai-prompt"
          placeholder="e.g., Monthly sales trend for 2024 with comparison to last year..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          disabled={isGenerating}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Be specific about what data you want to visualize and how it should look
        </p>
      </div>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Advanced Options
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          {/* Preferences */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Preferences</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={audience} onValueChange={(v: any) => setAudience(v)}>
                  <SelectTrigger id="audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="exec">Executive</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impressiveness">Visual Style</Label>
                <Select value={impressiveness} onValueChange={(v: any) => setImpressiveness(v)}>
                  <SelectTrigger id="impressiveness">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="stunning">Stunning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="colorblind">Color Blind Safe</Label>
                <Switch
                  id="colorblind"
                  checked={colorBlindSafe}
                  onCheckedChange={setColorBlindSafe}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="performance">Performance</Label>
                <Select value={performance} onValueChange={(v: any) => setPerformance(v)}>
                  <SelectTrigger id="performance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="speed">Speed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Constraints</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allowpies">Allow Pie Charts</Label>
                <Switch
                  id="allowpies"
                  checked={allowPies}
                  onCheckedChange={setAllowPies}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="smallscreen">Mobile Optimized</Label>
                <Switch
                  id="smallscreen"
                  checked={smallScreen}
                  onCheckedChange={setSmallScreen}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxseries">Max Series: {maxSeries}</Label>
                <input
                  type="range"
                  id="maxseries"
                  min="1"
                  max="20"
                  value={maxSeries}
                  onChange={(e) => setMaxSeries(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxcategories">Max Categories: {maxCategories}</Label>
                <input
                  type="range"
                  id="maxcategories"
                  min="5"
                  max="50"
                  value={maxCategories}
                  onChange={(e) => setMaxCategories(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate Charts'}
      </Button>
    </div>
  );
}