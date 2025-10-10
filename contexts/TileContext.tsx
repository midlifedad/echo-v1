'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TileContextType, TileData, TileType } from '@/lib/types';
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

  const addTile = (type: TileType) => {
    // Generate next available numeric ID
    const existingIds = tiles.map(t => parseInt(t.id)).filter(id => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : tiles.length + 1;
    
    const newTile: TileData = {
      id: nextId.toString(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} ${type === 'text' || type === 'image' || type === 'smart' ? 'Tile' : 'Chart'}`,
      position: tiles.length,
      config: {
        type,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} ${type === 'text' || type === 'image' || type === 'smart' ? 'Tile' : 'Chart'}`,
        options: {}
      },
      // Default text tiles to hide title
      displaySettings: type === 'text' ? { showTitle: false } : undefined
    };
    
    const updatedTiles = [...tiles, newTile];
    setTiles(updatedTiles);
    saveTiles(updatedTiles);
  };

  const removeTile = async (id: string, onCleanup?: (tileId: string) => void) => {
    // Optimistic update - update local state immediately for responsive UI
    const updatedTiles = tiles.filter(tile => tile.id !== id)
      .map((tile, index) => ({ ...tile, position: index }));
    setTiles(updatedTiles);
    saveTiles(updatedTiles);

    // Call cleanup function if provided (to clean up layout data)
    if (onCleanup) {
      onCleanup(id);
    }

    // Persist to database
    try {
      const response = await fetch(`/api/instances/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        console.error('Failed to delete tile from database');
      }
    } catch (error) {
      console.error('Failed to delete tile:', error);
      // Note: We keep the optimistic update even on error
      // Could add error state/toast notification here
    }
  };

  const updateTile = async (id: string, updates: Partial<TileData>) => {
    // Optimistic update - update local state immediately for responsive UI
    const updatedTiles = tiles.map(tile =>
      tile.id === id ? { ...tile, ...updates } : tile
    );
    setTiles(updatedTiles);
    saveTiles(updatedTiles);

    // Persist to database
    try {
      const response = await fetch(`/api/instances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        console.error('Failed to persist tile update to database');
      }
    } catch (error) {
      console.error('Failed to persist tile update:', error);
      // Note: We keep the optimistic update even on error
      // Could add error state/toast notification here
    }
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