/**
 * Compatibility layer for transitioning from tile-based to template/instance pattern
 * This provides adapters and utilities to maintain backward compatibility
 */

import type { 
  Tile, 
  TileInstance, 
  LayoutTile as NewLayoutTile,
  TileWithPositions 
} from '@/lib/types/database';

// Extend LayoutTile to include both old and new field names for compatibility
export interface CompatibleLayoutTile extends NewLayoutTile {
  tileId?: string; // Legacy field - maps to tileInstanceId
  tile_id?: string; // Alternative legacy field name
}

/**
 * Convert legacy tileId to tileInstanceId in layout tiles
 */
export function normalizeLayoutTile(layoutTile: any): NewLayoutTile {
  return {
    ...layoutTile,
    tileInstanceId: layoutTile.tileInstanceId || layoutTile.tileId || layoutTile.tile_id,
    layoutId: layoutTile.layoutId || layoutTile.layout_id,
    breakpoint: layoutTile.breakpoint,
    position: layoutTile.position,
    isVisible: layoutTile.isVisible ?? layoutTile.is_visible ?? true,
    inheritanceMode: layoutTile.inheritanceMode || layoutTile.inheritance_mode || 'inherit'
  };
}

/**
 * Create a tile instance from a legacy tile
 */
export function tileToInstance(tile: Tile, layoutId: string): Partial<TileInstance> {
  return {
    id: `instance_${layoutId}_${tile.id}`,
    templateId: null, // No template for legacy tiles
    layoutId: layoutId,
    parentInstanceId: null,
    type: tile.type,
    title: tile.title,
    config: tile.config,
    data: tile.data,
    content: (tile as any).content || null,
    dataSource: tile.dataSource,
    displaySettings: {
      showBorder: true,
      expandable: true,
      showTitle: true,
      titlePosition: 'top'
    },
    isModified: true, // All legacy tiles are considered modified
    lastSyncedAt: null,
    createdAt: tile.createdAt,
    updatedAt: tile.updatedAt
  };
}

/**
 * Create backward-compatible tile with positions
 */
export function instanceToTileWithPositions(
  instance: TileInstance,
  positions: Record<string, any>
): TileWithPositions {
  return {
    id: instance.id,
    type: instance.type,
    title: instance.title,
    config: instance.config,
    data: instance.data,
    dataSource: instance.dataSource,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
    positions: positions
  } as TileWithPositions;
}

/**
 * Add backward-compatible tileId field to responses
 */
export function addCompatibilityFields<T extends { tileInstanceId?: string }>(
  obj: T
): T & { tileId?: string } {
  if (obj.tileInstanceId) {
    return {
      ...obj,
      tileId: obj.tileInstanceId // Add legacy field
    };
  }
  return obj;
}

/**
 * Handle nullable dates safely
 */
export function safeDate(date: Date | number | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date === 'number') return new Date(date);
  return null;
}

/**
 * Format date for display, handling nulls
 */
export function formatDate(date: Date | number | null | undefined): string {
  const safeD = safeDate(date);
  if (!safeD) return 'Never';
  return safeD.toLocaleDateString();
}