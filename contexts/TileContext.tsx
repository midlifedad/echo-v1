'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TileContextType, TileData, ChartType } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';

const TileContext = createContext<TileContextType | undefined>(undefined);

export function TileProvider({ children }: { children: React.ReactNode }) {
  const [tiles, setTiles] = useState<TileData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TILES);
    if (saved) {
      const savedTiles = JSON.parse(saved);
      setTiles(savedTiles);
    } else {
      // Default tiles for demo - IDs match layout expectations
      const defaultTiles: TileData[] = [
        {
          id: '1',
          type: 'line',
          title: 'Revenue Trend',
          position: 0,
          config: {
            type: 'line',
            title: 'Revenue Trend',
            options: {}
          }
        },
        {
          id: '2',
          type: 'column',
          title: 'Monthly Sales',
          position: 1,
          config: {
            type: 'column',
            title: 'Monthly Sales',
            options: {}
          }
        },
        {
          id: '3',
          type: 'pie',
          title: 'Traffic Sources',
          position: 2,
          config: {
            type: 'pie',
            title: 'Traffic Sources',
            options: {}
          }
        },
        {
          id: '4',
          type: 'area',
          title: 'User Engagement',
          position: 3,
          config: {
            type: 'area',
            title: 'User Engagement',
            options: {}
          }
        },
        {
          id: '5',
          type: 'bar',
          title: 'Performance Metrics',
          position: 4,
          config: {
            type: 'bar',
            title: 'Performance Metrics',
            options: {}
          }
        }
      ];
      setTiles(defaultTiles);
      saveTiles(defaultTiles);
    }
  }, []);

  const saveTiles = (tilesToSave: TileData[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TILES, JSON.stringify(tilesToSave));
    } catch (error) {
      console.error('Failed to save tiles:', error);
    }
  };

  const addTile = (type: ChartType) => {
    // Generate next available numeric ID
    const existingIds = tiles.map(t => parseInt(t.id)).filter(id => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : tiles.length + 1;
    
    const newTile: TileData = {
      id: nextId.toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      position: tiles.length,
      config: {
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
        options: {}
      }
    };
    
    const updatedTiles = [...tiles, newTile];
    setTiles(updatedTiles);
    saveTiles(updatedTiles);
  };

  const removeTile = (id: string, onCleanup?: (tileId: string) => void) => {
    const updatedTiles = tiles.filter(tile => tile.id !== id)
      .map((tile, index) => ({ ...tile, position: index }));
    setTiles(updatedTiles);
    saveTiles(updatedTiles);
    
    // Call cleanup function if provided (to clean up layout data)
    if (onCleanup) {
      onCleanup(id);
    }
  };

  const updateTile = (id: string, updates: Partial<TileData>) => {
    const updatedTiles = tiles.map(tile => 
      tile.id === id ? { ...tile, ...updates } : tile
    );
    setTiles(updatedTiles);
    saveTiles(updatedTiles);
  };

  const reorderTiles = (reorderedTiles: TileData[]) => {
    const tilesWithPositions = reorderedTiles.map((tile, index) => ({
      ...tile,
      position: index
    }));
    setTiles(tilesWithPositions);
    saveTiles(tilesWithPositions);
  };

  const value: TileContextType = {
    tiles,
    addTile,
    removeTile,
    updateTile,
    reorderTiles,
  };

  return (
    <TileContext.Provider value={value}>
      {children}
    </TileContext.Provider>
  );
}

export function useTiles() {
  const context = useContext(TileContext);
  if (context === undefined) {
    throw new Error('useTiles must be used within a TileProvider');
  }
  return context;
}