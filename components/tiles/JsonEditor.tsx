'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X, Copy, Braces } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function JsonEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter JSON data',
  className,
  rows = 6 
}: JsonEditorProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      setText(JSON.stringify(value, null, 2));
      setError(null);
      setIsValid(true);
    } catch (e) {
      setText('');
      setError('Invalid JSON data');
      setIsValid(false);
    }
  }, [value]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    
    if (!newText.trim()) {
      setError(null);
      setIsValid(true);
      onChange([]);
      return;
    }

    try {
      const parsed = JSON.parse(newText);
      onChange(parsed);
      setError(null);
      setIsValid(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setIsValid(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setError(null);
      setIsValid(true);
    } catch (e) {
      setError('Cannot format invalid JSON');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Braces className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">JSON Data</span>
          {isValid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={formatJson}
            disabled={!isValid}
          >
            Format
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            'font-mono text-sm',
            !isValid && 'border-red-500 focus:border-red-500',
            className
          )}
          spellCheck={false}
        />
        
        {error && (
          <div className="absolute -bottom-6 left-0 text-xs text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}