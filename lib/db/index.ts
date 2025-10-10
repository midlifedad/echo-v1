import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create SQLite database connection
const sqlite = new Database(path.join(dataDir, 'dashboard.db'));

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with tables
export function initDatabase() {
  // Create layouts table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS layouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      config TEXT,
      is_default INTEGER DEFAULT 0,
      is_shared INTEGER DEFAULT 0,
      owner_id TEXT,
      tags TEXT,
      metadata TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // Create tile_templates table
  sqlite.exec(`
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
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // Create tile_instances table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tile_instances (
      id TEXT PRIMARY KEY,
      template_id TEXT,
      layout_id TEXT NOT NULL,
      parent_instance_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      config TEXT NOT NULL,
      data TEXT,
      content TEXT,
      data_source TEXT,
      display_settings TEXT,
      is_modified INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (template_id) REFERENCES tile_templates(id) ON DELETE SET NULL,
      FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE
    )
  `);

  // Create layout_tile_positions table
  sqlite.exec(`
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

  // Create pages table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      layout_id TEXT NOT NULL,
      filters TEXT,
      refresh_interval INTEGER,
      access TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (layout_id) REFERENCES layouts(id)
    )
  `);

  // Create user_template_favorites table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS user_template_favorites (
      user_id TEXT NOT NULL,
      template_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, template_id),
      FOREIGN KEY (template_id) REFERENCES tile_templates(id) ON DELETE CASCADE
    )
  `);

  // Create legacy tiles table for backward compatibility
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tiles (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      name TEXT,
      description TEXT,
      category TEXT,
      tags TEXT,
      is_template INTEGER DEFAULT 0,
      thumbnail TEXT,
      owner_id TEXT,
      is_public INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      config TEXT NOT NULL,
      data TEXT,
      content TEXT,
      data_source TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // Create legacy layout_tiles table for backward compatibility
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS layout_tiles (
      layout_id TEXT NOT NULL,
      tile_id TEXT NOT NULL,
      positions TEXT,
      PRIMARY KEY (layout_id, tile_id),
      FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE,
      FOREIGN KEY (tile_id) REFERENCES tiles(id) ON DELETE CASCADE
    )
  `);

  // Create legacy user_tile_favorites table for backward compatibility
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS user_tile_favorites (
      user_id TEXT NOT NULL,
      tile_id TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, tile_id),
      FOREIGN KEY (tile_id) REFERENCES tiles(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_tile_instances_template_id ON tile_instances(template_id);
    CREATE INDEX IF NOT EXISTS idx_tile_instances_layout_id ON tile_instances(layout_id);
    CREATE INDEX IF NOT EXISTS idx_layout_tile_positions_layout_id ON layout_tile_positions(layout_id);
    CREATE INDEX IF NOT EXISTS idx_layout_tile_positions_instance_id ON layout_tile_positions(tile_instance_id);
    CREATE INDEX IF NOT EXISTS idx_pages_layout_id ON pages(layout_id);
    CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
  `);

  console.log('Database initialized successfully');
}

// Initialize on module load
initDatabase();

export default db;