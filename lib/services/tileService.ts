import { db } from '@/lib/db';
import { tiles, layoutTiles, userTileFavorites, tileInstances, type Tile, type NewTile } from '@/lib/db/schema';
import { eq, and, inArray, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export class TileService {
  // Create a new tile
  static async createTile(tile: Partial<NewTile>): Promise<Tile> {
    const id = tile.id || nanoid();
    const now = new Date();
    
    const newTile: NewTile = {
      id,
      type: tile.type || 'line',
      title: tile.title || 'New Tile',
      name: tile.name || tile.title || 'New Tile',
      description: tile.description,
      category: tile.category,
      tags: tile.tags,
      isTemplate: tile.isTemplate || false,
      thumbnail: tile.thumbnail,
      ownerId: tile.ownerId,
      isPublic: tile.isPublic || false,
      usageCount: tile.usageCount || 0,
      config: tile.config || {
        type: tile.type || 'line',
        title: tile.title || 'New Tile',
        options: {}
      },
      data: tile.data || null,
      dataSource: tile.dataSource || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(tiles).values(newTile).returning();
    return result[0];
  }

  // Get a tile by ID
  static async getTile(id: string): Promise<Tile | null> {
    const result = await db.select().from(tiles).where(eq(tiles.id, id));
    return result[0] || null;
  }

  // Get all tiles
  static async listTiles(): Promise<Tile[]> {
    return await db.select().from(tiles);
  }

  // Get tiles for a specific layout
  static async getTilesForLayout(layoutId: string): Promise<any[]> {
    const layoutTileRecords = await db.select()
      .from(layoutTiles)
      .where(eq(layoutTiles.layoutId, layoutId));
    
    if (layoutTileRecords.length === 0) return [];
    
    const tileInstanceIds = [...new Set(layoutTileRecords.map(lt => lt.tileInstanceId))];
    
    // Get tile instances - they don't have type field, so parse it from config
    const instances = await db.select()
      .from(tileInstances)
      .where(inArray(tileInstances.id, tileInstanceIds));
    
    // Return instances formatted as tiles for compatibility
    return instances.map(instance => {
      // Parse type from config if it exists
      let type = 'line'; // default
      if (instance.config) {
        try {
          const config = typeof instance.config === 'string' ? JSON.parse(instance.config) : instance.config;
          type = config.type || 'line';
        } catch (e) {
          console.error('Error parsing config:', e);
        }
      }
      
      return {
        id: instance.id,
        type: type,
        title: instance.title || 'Untitled',
        config: instance.config,
        data: instance.data,
        content: instance.content,
        dataSource: instance.dataSource,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt
      };
    });
  }

  // Update a tile
  static async updateTile(id: string, updates: Partial<NewTile>): Promise<Tile | null> {
    const updatedTile = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db.update(tiles)
      .set(updatedTile)
      .where(eq(tiles.id, id))
      .returning();
    
    return result[0] || null;
  }

  // Delete a tile
  static async deleteTile(id: string): Promise<boolean> {
    // This will cascade delete from layout_tiles due to foreign key constraint
    const result = await db.delete(tiles).where(eq(tiles.id, id)).returning();
    return result.length > 0;
  }

  // Update tile configuration
  static async updateTileConfig(id: string, config: any): Promise<Tile | null> {
    return await this.updateTile(id, { config });
  }

  // Update tile data
  static async updateTileData(id: string, data: any): Promise<Tile | null> {
    return await this.updateTile(id, { data });
  }

  // Refresh tile data (placeholder for future implementation)
  static async refreshTileData(id: string): Promise<void> {
    const tile = await this.getTile(id);
    if (!tile || !tile.dataSource) return;

    // TODO: Implement data fetching based on dataSource
    // For now, this is a placeholder
    console.log(`Refreshing data for tile ${id}`);
    
    // Example implementation:
    // if (tile.dataSource.type === 'api') {
    //   const response = await fetch(tile.dataSource.endpoint);
    //   const data = await response.json();
    //   await this.updateTileData(id, data);
    // }
  }

  // Duplicate a tile
  static async duplicateTile(id: string, newTitle?: string): Promise<Tile | null> {
    const originalTile = await this.getTile(id);
    if (!originalTile) return null;

    return await this.createTile({
      type: originalTile.type,
      title: newTitle || `${originalTile.title} (Copy)`,
      config: originalTile.config,
      data: originalTile.data,
      dataSource: originalTile.dataSource,
    });
  }

  // Get tiles by type
  static async getTilesByType(type: string): Promise<Tile[]> {
    return await db.select().from(tiles).where(eq(tiles.type, type));
  }

  // Batch create tiles
  static async createTiles(tilesData: Partial<NewTile>[]): Promise<Tile[]> {
    const newTiles: NewTile[] = tilesData.map(tile => {
      const now = new Date();
      return {
        id: tile.id || nanoid(),
        type: tile.type || 'line',
        title: tile.title || 'New Tile',
        config: tile.config || {
          type: tile.type || 'line',
          title: tile.title || 'New Tile',
          options: {}
        },
        data: tile.data || null,
        dataSource: tile.dataSource || null,
        createdAt: now,
        updatedAt: now,
      };
    });

    return await db.insert(tiles).values(newTiles).returning();
  }

  // Get tile usage count (how many layouts use this tile)
  static async getTileUsageCount(tileId: string): Promise<number> {
    const result = await db.select()
      .from(layoutTiles)
      .where(eq(layoutTiles.tileInstanceId, tileId));
    
    // Count unique layout IDs
    const uniqueLayouts = new Set(result.map(lt => lt.layoutId));
    return uniqueLayouts.size;
  }

  // List tiles with filters
  static async listTilesWithFilters(filters?: {
    category?: string;
    isTemplate?: boolean;
    isPublic?: boolean;
    ownerId?: string;
    search?: string;
  }): Promise<Tile[]> {
    let query = db.select().from(tiles);
    
    if (filters) {
      const conditions = [];
      
      if (filters.category) {
        conditions.push(eq(tiles.category, filters.category));
      }
      
      if (filters.isTemplate !== undefined) {
        conditions.push(eq(tiles.isTemplate, filters.isTemplate));
      }
      
      if (filters.isPublic !== undefined) {
        conditions.push(eq(tiles.isPublic, filters.isPublic));
      }
      
      if (filters.ownerId) {
        conditions.push(eq(tiles.ownerId, filters.ownerId));
      }
      
      if (filters.search) {
        conditions.push(
          sql`${tiles.name} LIKE ${`%${filters.search}%`} OR 
              ${tiles.description} LIKE ${`%${filters.search}%`} OR 
              ${tiles.title} LIKE ${`%${filters.search}%`}`
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(tiles.createdAt));
  }

  // Toggle favorite status for a tile
  static async toggleFavorite(userId: string, tileId: string): Promise<{ favorited: boolean }> {
    const existing = await db.select()
      .from(userTileFavorites)
      .where(
        and(
          eq(userTileFavorites.userId, userId),
          eq(userTileFavorites.tileId, tileId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Remove favorite
      await db.delete(userTileFavorites)
        .where(
          and(
            eq(userTileFavorites.userId, userId),
            eq(userTileFavorites.tileId, tileId)
          )
        );
      return { favorited: false };
    } else {
      // Add favorite
      await db.insert(userTileFavorites).values({
        userId,
        tileId,
        createdAt: new Date(),
      });
      return { favorited: true };
    }
  }

  // Get user's favorite tiles
  static async getUserFavorites(userId: string): Promise<Tile[]> {
    const favorites = await db.select({
      tile: tiles,
    })
      .from(tiles)
      .innerJoin(userTileFavorites, eq(tiles.id, userTileFavorites.tileId))
      .where(eq(userTileFavorites.userId, userId))
      .orderBy(desc(userTileFavorites.createdAt));
    
    return favorites.map(f => f.tile);
  }

  // Get popular tiles
  static async getPopularTiles(limit: number = 10): Promise<Tile[]> {
    return db.select()
      .from(tiles)
      .where(eq(tiles.isPublic, true))
      .orderBy(desc(tiles.usageCount))
      .limit(limit);
  }

  // Get template tiles
  static async getTemplateTiles(): Promise<Tile[]> {
    return db.select()
      .from(tiles)
      .where(eq(tiles.isTemplate, true))
      .orderBy(desc(tiles.usageCount));
  }

  // Get tile categories
  static async getCategories(): Promise<string[]> {
    const result = await db.selectDistinct({
      category: tiles.category,
    })
      .from(tiles)
      .where(sql`${tiles.category} IS NOT NULL`);
    
    return result.map(r => r.category).filter(Boolean) as string[];
  }

  // Increment usage count
  static async incrementUsageCount(tileId: string): Promise<void> {
    await db.update(tiles)
      .set({
        usageCount: sql`${tiles.usageCount} + 1`,
      })
      .where(eq(tiles.id, tileId));
  }

  // Convert tile to template
  static async convertToTemplate(tileId: string): Promise<Tile | null> {
    return this.updateTile(tileId, {
      isTemplate: true,
      isPublic: true,
    });
  }

  // Search tiles
  static async searchTiles(searchTerm: string): Promise<Tile[]> {
    return db.select()
      .from(tiles)
      .where(
        sql`${tiles.name} LIKE ${`%${searchTerm}%`} OR 
            ${tiles.description} LIKE ${`%${searchTerm}%`} OR 
            ${tiles.title} LIKE ${`%${searchTerm}%`}`
      )
      .orderBy(desc(tiles.usageCount));
  }
}