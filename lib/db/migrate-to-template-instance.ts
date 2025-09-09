/**
 * Migration script to transform the database from direct tile references
 * to a template/instance pattern.
 * 
 * This migration:
 * 1. Creates new tables for tile_templates and tile_instances
 * 2. Migrates existing tiles to templates (if isTemplate=true) or instances
 * 3. Updates layout_tiles to reference instances
 * 4. Preserves all existing relationships and data
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { 
  tiles, 
  tileTemplates, 
  tileInstances, 
  layoutTiles,
  userTileFavorites,
  userTemplateFavorites 
} from './schema';

// Initialize database connection
const sqlite = new Database('dashboard.db');
const db = drizzle(sqlite);

interface MigrationResult {
  success: boolean;
  templatesCreated: number;
  instancesCreated: number;
  layoutTilesUpdated: number;
  favoritesUpdated: number;
  errors: string[];
}

export async function migrateToTemplateInstance(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    templatesCreated: 0,
    instancesCreated: 0,
    layoutTilesUpdated: 0,
    favoritesUpdated: 0,
    errors: []
  };

  try {
    // Start transaction
    await db.transaction(async (tx) => {
      console.log('Starting template/instance migration...');

      // Step 1: Create new tables (if not exists)
      await tx.run(sql`
        CREATE TABLE IF NOT EXISTS tile_templates (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          name TEXT,
          description TEXT,
          category TEXT,
          tags TEXT,
          is_system INTEGER DEFAULT 0,
          thumbnail TEXT,
          owner_id TEXT,
          is_public INTEGER DEFAULT 0,
          usage_count INTEGER DEFAULT 0,
          config TEXT NOT NULL,
          data TEXT,
          content TEXT,
          data_source TEXT,
          default_display_settings TEXT,
          created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
          updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await tx.run(sql`
        CREATE TABLE IF NOT EXISTS tile_instances (
          id TEXT PRIMARY KEY,
          template_id TEXT REFERENCES tile_templates(id) ON DELETE SET NULL,
          layout_id TEXT NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
          parent_instance_id TEXT,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          config TEXT NOT NULL,
          data TEXT,
          content TEXT,
          data_source TEXT,
          display_settings TEXT,
          is_modified INTEGER DEFAULT 0,
          last_synced_at INTEGER,
          created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
          updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await tx.run(sql`
        CREATE TABLE IF NOT EXISTS user_template_favorites (
          user_id TEXT NOT NULL,
          template_id TEXT NOT NULL REFERENCES tile_templates(id) ON DELETE CASCADE,
          created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, template_id)
        )
      `);

      // Step 2: Get all existing tiles
      const existingTiles = await tx.select().from(tiles).all();
      console.log(`Found ${existingTiles.length} existing tiles to migrate`);

      // Step 3: Track template ID mappings (old tile ID -> new template ID)
      const templateIdMap = new Map<string, string>();
      const instanceIdMap = new Map<string, string>();

      // Step 4: Migrate tiles marked as templates
      const templateTiles = existingTiles.filter(t => t.isTemplate);
      for (const tile of templateTiles) {
        const templateId = `template_${tile.id}`;
        templateIdMap.set(tile.id, templateId);

        await tx.insert(tileTemplates).values({
          id: templateId,
          type: tile.type,
          title: tile.title,
          name: tile.name,
          description: tile.description,
          category: tile.category,
          tags: tile.tags,
          isSystem: false,
          thumbnail: tile.thumbnail,
          ownerId: tile.ownerId,
          isPublic: tile.isPublic,
          usageCount: tile.usageCount || 0,
          config: tile.config,
          data: tile.data,
          content: tile.content,
          dataSource: tile.dataSource,
          defaultDisplaySettings: {
            showBorder: true,
            expandable: true,
            showTitle: true,
            titlePosition: 'top'
          },
          createdAt: tile.createdAt,
          updatedAt: tile.updatedAt
        });

        result.templatesCreated++;
      }

      // Step 5: Get all layout-tile relationships
      const existingLayoutTiles = await tx.run(sql`
        SELECT DISTINCT layout_id, tile_id FROM layout_tiles
      `).all() as any[];

      // Step 6: Create instances for tiles used in layouts
      for (const lt of existingLayoutTiles) {
        const originalTile = existingTiles.find(t => t.id === lt.tile_id);
        if (!originalTile) continue;

        const instanceId = `instance_${lt.layout_id}_${lt.tile_id}`;
        instanceIdMap.set(`${lt.layout_id}_${lt.tile_id}`, instanceId);

        // Determine if this tile has a template
        const templateId = templateIdMap.get(lt.tile_id) || null;

        await tx.insert(tileInstances).values({
          id: instanceId,
          templateId: templateId,
          layoutId: lt.layout_id,
          parentInstanceId: null,
          type: originalTile.type,
          title: originalTile.title,
          config: originalTile.config,
          data: originalTile.data,
          content: originalTile.content,
          dataSource: originalTile.dataSource,
          displaySettings: {
            showBorder: true,
            expandable: true,
            showTitle: true,
            titlePosition: 'top'
          },
          isModified: !templateId, // If no template, it's a custom instance
          lastSyncedAt: templateId ? Date.now() : null,
          createdAt: originalTile.createdAt,
          updatedAt: originalTile.updatedAt
        });

        result.instancesCreated++;
      }

      // Step 7: Create a new layout_tiles table with updated references
      await tx.run(sql`
        CREATE TABLE IF NOT EXISTS layout_tiles_new (
          layout_id TEXT NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
          tile_instance_id TEXT NOT NULL REFERENCES tile_instances(id) ON DELETE CASCADE,
          breakpoint TEXT NOT NULL,
          position TEXT NOT NULL,
          is_visible INTEGER DEFAULT 1,
          inheritance_mode TEXT DEFAULT 'inherit',
          PRIMARY KEY (layout_id, tile_instance_id, breakpoint)
        )
      `);

      // Step 8: Migrate layout_tiles data
      const allLayoutTiles = await tx.run(sql`
        SELECT * FROM layout_tiles
      `).all() as any[];

      for (const lt of allLayoutTiles) {
        const instanceId = instanceIdMap.get(`${lt.layout_id}_${lt.tile_id}`);
        if (!instanceId) continue;

        await tx.run(sql`
          INSERT INTO layout_tiles_new (
            layout_id, 
            tile_instance_id, 
            breakpoint, 
            position, 
            is_visible, 
            inheritance_mode
          ) VALUES (
            ${lt.layout_id},
            ${instanceId},
            ${lt.breakpoint},
            ${lt.position},
            ${lt.is_visible},
            ${lt.inheritance_mode}
          )
        `);

        result.layoutTilesUpdated++;
      }

      // Step 9: Swap tables
      await tx.run(sql`DROP TABLE IF EXISTS layout_tiles_old`);
      await tx.run(sql`ALTER TABLE layout_tiles RENAME TO layout_tiles_old`);
      await tx.run(sql`ALTER TABLE layout_tiles_new RENAME TO layout_tiles`);

      // Step 10: Migrate user favorites
      const existingFavorites = await tx.select().from(userTileFavorites).all();
      for (const fav of existingFavorites) {
        const templateId = templateIdMap.get(fav.tileId);
        if (templateId) {
          await tx.insert(userTemplateFavorites).values({
            userId: fav.userId,
            templateId: templateId,
            createdAt: fav.createdAt
          });
          result.favoritesUpdated++;
        }
      }

      // Step 11: Create tiles that weren't templates or in layouts as orphan templates
      const processedTileIds = new Set([
        ...Array.from(templateIdMap.keys()),
        ...existingLayoutTiles.map(lt => lt.tile_id)
      ]);

      const orphanTiles = existingTiles.filter(t => !processedTileIds.has(t.id));
      for (const tile of orphanTiles) {
        const templateId = `template_orphan_${tile.id}`;
        
        await tx.insert(tileTemplates).values({
          id: templateId,
          type: tile.type,
          title: tile.title,
          name: tile.name || `Migrated: ${tile.title}`,
          description: tile.description || 'Migrated from legacy tile',
          category: tile.category || 'migrated',
          tags: tile.tags,
          isSystem: false,
          thumbnail: tile.thumbnail,
          ownerId: tile.ownerId,
          isPublic: tile.isPublic,
          usageCount: 0,
          config: tile.config,
          data: tile.data,
          content: tile.content,
          dataSource: tile.dataSource,
          defaultDisplaySettings: {
            showBorder: true,
            expandable: true,
            showTitle: true,
            titlePosition: 'top'
          },
          createdAt: tile.createdAt,
          updatedAt: tile.updatedAt
        });

        result.templatesCreated++;
      }

      console.log('Migration completed successfully!');
      result.success = true;
    });

  } catch (error) {
    console.error('Migration failed:', error);
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return result;
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToTemplateInstance().then(result => {
    console.log('Migration Result:', result);
    process.exit(result.success ? 0 : 1);
  });
}