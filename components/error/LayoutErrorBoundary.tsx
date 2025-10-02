'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary component for graceful error handling in layout system
 * Provides recovery options and error reporting
 */
export class LayoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('Layout error caught:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error details for display
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Clear error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    // Force page reload
    window.location.reload();
  };

  clearLayoutData = () => {
    // Clear all layout data from localStorage
    const keys = [
      'dashboard-grid-layouts',
      'dashboard-layout-inheritance',
      'dashboard-custom-layouts',
      'dashboard-locked-tiles',
      'dashboard-locked-positions',
    ];
    
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Failed to clear ${key}:`, e);
      }
    });
    
    // Reload page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Layout Error</h2>
            </div>
            
            <p className="text-sm text-muted-foreground">
              An error occurred while rendering the layout. This might be due to corrupted layout data or a temporary issue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleReload}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Reload Page
              </Button>
              
              <Button
                onClick={this.clearLayoutData}
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
              >
                Reset Layout Data
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withLayoutErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <LayoutErrorBoundary fallback={fallback}>
      <Component {...props} />
    </LayoutErrorBoundary>
  );

  WrappedComponent.displayName = `withLayoutErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}