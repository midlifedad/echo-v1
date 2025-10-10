'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breakpoint } from '@/lib/types';
import { BREAKPOINTS } from '@/lib/constants';

/**
 * Custom hook for managing responsive breakpoints
 * Provides current breakpoint detection and utilities
 */
export function useBreakpoint() {
  const getBreakpointFromWidth = useCallback((width: number): Breakpoint => {
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }, []);

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window !== 'undefined') {
      return getBreakpointFromWidth(window.innerWidth);
    }
    return 'lg';
  });

  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return BREAKPOINTS.lg;
  });

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newBreakpoint = getBreakpointFromWidth(newWidth);
      
      setWindowWidth(newWidth);
      setCurrentBreakpoint(newBreakpoint);
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getBreakpointFromWidth]);

  const isBreakpoint = useCallback((breakpoint: Breakpoint) => {
    return currentBreakpoint === breakpoint;
  }, [currentBreakpoint]);

  const isAtLeast = useCallback((breakpoint: Breakpoint) => {
    const currentIndex = ['xs', 'sm', 'md', 'lg'].indexOf(currentBreakpoint);
    const targetIndex = ['xs', 'sm', 'md', 'lg'].indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }, [currentBreakpoint]);

  const isAtMost = useCallback((breakpoint: Breakpoint) => {
    const currentIndex = ['xs', 'sm', 'md', 'lg'].indexOf(currentBreakpoint);
    const targetIndex = ['xs', 'sm', 'md', 'lg'].indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }, [currentBreakpoint]);

  return {
    currentBreakpoint,
    windowWidth,
    isBreakpoint,
    isAtLeast,
    isAtMost,
    getBreakpointFromWidth,
  };
}