#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'data', 'dashboard.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Starting migration to template/instance architecture...');

try {
  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Step 1: Create new tables
  console.log('Creating new tables...');
  
  // Create tile_templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tile_templates (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      tags TEXT,
      thumbnail TEXT,
      owner_id TEXT,
      is_public INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      content TEXT,
      default_config TEXT,
      default_data TEXT,
      default_data_source TEXT,
      default_display_settings TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // Create tile_instances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tile_instances (
      id TEXT PRIMARY KEY,
      template_id TEXT,
      layout_id TEXT NOT NULL,
      parent_instance_id TEXT,
      title TEXT,
      content TEXT,
      config TEXT,
      data TEXT,
      data_source TEXT,
      display_settings TEXT,
      is_modified INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (template_id) REFERENCES tile_templates(id) ON DELETE SET NULL,
      FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE
    )
  `);

  // Create new layout_tile_positions table (replaces layout_tiles)
  db.exec(`
    CREATE TABLE IF NOT EXISTS layout_tile_positions (
      layout_id TEXT NOT NULL,
      tile_instance_id TEXT NOT NULL,
      breakpoint TEXT NOT NULL,
      position TEXT NOT NULL,
      is_visible INTEGER DEFAULT 1,
      inheritance_mode TEXT DEFAULT 'inherit',
      PRIMARY KEY (layout_id, tile_instance_id, breakpoint),
      FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE,
      FOREIGN KEY (tile_instance_id) REFERENCES tile_instances(id) ON DELETE CASCADE
    )
  `);

  // Create user_template_favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_template_favorites (
      user_id TEXT NOT NULL,
      template_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, template_id),
      FOREIGN KEY (template_id) REFERENCES tile_templates(id) ON DELETE CASCADE
    )
  `);

  // Step 2: Migrate existing tiles to templates
  console.log('Migrating existing tiles to templates...');
  
  const tiles = db.prepare('SELECT * FROM tiles').all();
  const insertTemplate = db.prepare(`
    INSERT INTO tile_templates (
      id, type, name, description, category, tags, thumbnail,
      owner_id, is_public, usage_count, content,
      default_config, default_data, default_data_source,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?
    )
  `);

  for (const tile of tiles) {
    // Convert tile to template
    insertTemplate.run(
      tile.id,
      tile.type,
      tile.name || tile.title,
      tile.description,
      tile.category,
      tile.tags,
      tile.thumbnail,
      tile.owner_id,
      tile.is_public,
      tile.usage_count || 0,
      tile.content,
      tile.config,
      tile.data,
      tile.data_source,
      tile.created_at,
      tile.updated_at
    );
  }
  
  console.log(`Migrated ${tiles.length} tiles to templates`);

  // Step 3: Create instances for tiles used in layouts
  console.log('Creating instances for tiles in layouts...');
  
  const layoutTiles = db.prepare(`
    SELECT DISTINCT lt.*, t.* 
    FROM layout_tiles lt
    JOIN tiles t ON lt.tile_id = t.id
  `).all();
  
  const insertInstance = db.prepare(`
    INSERT INTO tile_instances (
      id, template_id, layout_id, title,
      content, config, data, data_source,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertPosition = db.prepare(`
    INSERT INTO layout_tile_positions (
      layout_id, tile_instance_id, breakpoint, position,
      is_visible, inheritance_mode
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  // Track instance IDs for each template/layout combination
  const instanceMap = new Map();
  
  for (const lt of layoutTiles) {
    const key = `${lt.layout_id}-${lt.tile_id}`;
    
    // Create instance if not already created
    if (!instanceMap.has(key)) {
      const instanceId = uuidv4();
      
      insertInstance.run(
        instanceId,
        lt.tile_id, // template_id
        lt.layout_id,
        lt.title,
        lt.content,
        lt.config,
        lt.data,
        lt.data_source,
        lt.created_at,
        lt.updated_at
      );
      
      instanceMap.set(key, instanceId);
    }
    
    // Add position entry
    const instanceId = instanceMap.get(key);
    insertPosition.run(
      lt.layout_id,
      instanceId,
      lt.breakpoint,
      lt.position,
      lt.is_visible,
      lt.inheritance_mode
    );
  }
  
  console.log(`Created ${instanceMap.size} instances from layout tiles`);

  // Step 4: Migrate user favorites
  console.log('Migrating user favorites...');
  
  const favorites = db.prepare('SELECT * FROM user_tile_favorites').all();
  const insertFavorite = db.prepare(`
    INSERT OR IGNORE INTO user_template_favorites (user_id, template_id, created_at)
    VALUES (?, ?, ?)
  `);
  
  for (const fav of favorites) {
    insertFavorite.run(fav.user_id, fav.tile_id, fav.created_at);
  }
  
  console.log(`Migrated ${favorites.length} user favorites`);

  // Step 5: Create indexes
  console.log('Creating indexes...');
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tile_instances_template_id ON tile_instances(template_id);
    CREATE INDEX IF NOT EXISTS idx_tile_instances_layout_id ON tile_instances(layout_id);
    CREATE INDEX IF NOT EXISTS idx_layout_tile_positions_layout_id ON layout_tile_positions(layout_id);
    CREATE INDEX IF NOT EXISTS idx_layout_tile_positions_instance_id ON layout_tile_positions(tile_instance_id);
  `);

  // Step 6: Backup old tables (rename instead of drop for safety)
  console.log('Backing up old tables...');
  
  db.exec(`
    ALTER TABLE tiles RENAME TO tiles_backup;
    ALTER TABLE layout_tiles RENAME TO layout_tiles_backup;
    ALTER TABLE user_tile_favorites RENAME TO user_tile_favorites_backup;
  `);

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('Migration completed successfully!');
  console.log('\nSummary:');
  console.log(`- Templates created: ${tiles.length}`);
  console.log(`- Instances created: ${instanceMap.size}`);
  console.log(`- Favorites migrated: ${favorites.length}`);
  console.log('\nOld tables have been renamed with _backup suffix for safety.');
  console.log('You can drop them manually once you verify everything works.');

} catch (error) {
  console.error('Migration failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}