import { db } from '@/lib/db';
import { layouts, layoutTiles, type Layout, type NewLayout, type LayoutTile, type NewLayoutTile } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export class LayoutService {
  // Create a new layout
  static async createLayout(layout: Partial<NewLayout>): Promise<Layout> {
    const id = layout.id || nanoid();
    const now = new Date();
    
    const newLayout: NewLayout = {
      id,
      name: layout.name || 'Untitled Layout',
      description: layout.description || null,
      isDefault: layout.isDefault || false,
      isShared: layout.isShared || false,
      ownerId: layout.ownerId || null,
      tags: layout.tags || null,
      metadata: layout.metadata || null,
      createdAt: now,
      updatedAt: now,
    };

    // If setting as default, unset other defaults
    if (newLayout.isDefault) {
      await db.update(layouts)
        .set({ isDefault: false })
        .where(eq(layouts.isDefault, true));
    }

    const result = await db.insert(layouts).values(newLayout).returning();
    return result[0];
  }

  // Get a layout by ID
  static async getLayout(id: string): Promise<Layout | null> {
    const result = await db.select().from(layouts).where(eq(layouts.id, id));
    return result[0] || null;
  }

  // Get all layouts
  static async listLayouts(filters?: {
    ownerId?: string;
    isShared?: boolean;
  }): Promise<Layout[]> {
    let query = db.select().from(layouts);
    
    if (filters?.ownerId) {
      query = query.where(eq(layouts.ownerId, filters.ownerId));
    }
    
    if (filters?.isShared !== undefined) {
      query = query.where(eq(layouts.isShared, filters.isShared));
    }
    
    return await query;
  }

  // Update a layout
  static async updateLayout(id: string, updates: Partial<NewLayout>): Promise<Layout | null> {
    const updatedLayout = {
      ...updates,
      updatedAt: new Date(),
    };

    // If setting as default, unset other defaults
    if (updatedLayout.isDefault) {
      await db.update(layouts)
        .set({ isDefault: false })
        .where(and(eq(layouts.isDefault, true), sql`id != ${id}`));
    }

    const result = await db.update(layouts)
      .set(updatedLayout)
      .where(eq(layouts.id, id))
      .returning();
    
    return result[0] || null;
  }

  // Delete a layout
  static async deleteLayout(id: string): Promise<boolean> {
    const result = await db.delete(layouts).where(eq(layouts.id, id)).returning();
    return result.length > 0;
  }

  // Duplicate a layout
  static async duplicateLayout(id: string, newName?: string): Promise<Layout | null> {
    const originalLayout = await this.getLayout(id);
    if (!originalLayout) return null;

    // Create new layout
    const newLayout = await this.createLayout({
      name: newName || `${originalLayout.name} (Copy)`,
      description: originalLayout.description,
      isDefault: false,
      isShared: originalLayout.isShared,
      ownerId: originalLayout.ownerId,
      tags: originalLayout.tags,
      metadata: originalLayout.metadata,
    });

    // Copy all tile positions
    const tiles = await this.getLayoutTiles(id);
    for (const tile of tiles) {
      await this.setTilePosition(
        newLayout.id,
        tile.tileInstanceId,
        tile.breakpoint,
        tile.position,
        tile.isVisible,
        tile.inheritanceMode
      );
    }

    return newLayout;
  }

  // Get the default layout
  static async getDefaultLayout(): Promise<Layout | null> {
    const result = await db.select().from(layouts).where(eq(layouts.isDefault, true));
    return result[0] || null;
  }

  // Get all tiles for a layout
  static async getLayoutTiles(layoutId: string): Promise<LayoutTile[]> {
    return await db.select()
      .from(layoutTiles)
      .where(eq(layoutTiles.layoutId, layoutId));
  }

  // Set tile position in a layout
  static async setTilePosition(
    layoutId: string,
    tileId: string,
    breakpoint: string,
    position: any,
    isVisible: boolean = true,
    inheritanceMode: 'inherit' | 'custom' = 'inherit'
  ): Promise<void> {
    const existing = await db.select()
      .from(layoutTiles)
      .where(and(
        eq(layoutTiles.layoutId, layoutId),
        eq(layoutTiles.tileInstanceId, tileId),
        eq(layoutTiles.breakpoint, breakpoint)
      ));

    const layoutTileData: NewLayoutTile = {
      layoutId,
      tileInstanceId: tileId,
      breakpoint,
      position,
      isVisible,
      inheritanceMode,
    };

    if (existing.length > 0) {
      // Update existing
      await db.update(layoutTiles)
        .set(layoutTileData)
        .where(and(
          eq(layoutTiles.layoutId, layoutId),
          eq(layoutTiles.tileInstanceId, tileId),
          eq(layoutTiles.breakpoint, breakpoint)
        ));
    } else {
      // Insert new
      await db.insert(layoutTiles).values(layoutTileData);
    }
  }

  // Remove a tile from a layout
  static async removeTileFromLayout(layoutId: string, tileId: string): Promise<void> {
    await db.delete(layoutTiles)
      .where(and(
        eq(layoutTiles.layoutId, layoutId),
        eq(layoutTiles.tileInstanceId, tileId)
      ));
  }

  // Add a tile to a layout with default positions
  static async addTileToLayout(
    layoutId: string,
    tileId: string,
    positions: Record<string, any>
  ): Promise<void> {
    const breakpoints = ['lg', 'md', 'sm'];
    
    for (const breakpoint of breakpoints) {
      if (positions[breakpoint]) {
        await this.setTilePosition(
          layoutId,
          tileId,
          breakpoint,
          positions[breakpoint]
        );
      }
    }
  }

  // Export layout as JSON
  static async exportLayout(id: string): Promise<string | null> {
    const layout = await this.getLayout(id);
    if (!layout) return null;

    const tiles = await this.getLayoutTiles(id);
    
    const exportData = {
      layout: {
        ...layout,
        id: undefined, // Remove ID for import
      },
      tiles,
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import layout from JSON
  static async importLayout(jsonData: string): Promise<Layout | null> {
    try {
      const data = JSON.parse(jsonData);
      
      // Create new layout
      const newLayout = await this.createLayout(data.layout);
      
      // Add tiles
      if (data.tiles && Array.isArray(data.tiles)) {
        for (const tile of data.tiles) {
          await this.setTilePosition(
            newLayout.id,
            tile.tileInstanceId,
            tile.breakpoint,
            tile.position,
            tile.isVisible,
            tile.inheritanceMode
          );
        }
      }
      
      return newLayout;
    } catch (error) {
      console.error('Failed to import layout:', error);
      return null;
    }
  }
}