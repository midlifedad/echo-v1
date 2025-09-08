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

  // Create tiles table
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
      data_source TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // Create layout_tiles junction table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS layout_tiles (
      layout_id TEXT NOT NULL,
      tile_id TEXT NOT NULL,
      breakpoint TEXT NOT NULL,
      position TEXT NOT NULL,
      is_visible INTEGER DEFAULT 1,
      inheritance_mode TEXT DEFAULT 'inherit',
      PRIMARY KEY (layout_id, tile_id, breakpoint),
      FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE,
      FOREIGN KEY (tile_id) REFERENCES tiles(id) ON DELETE CASCADE
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

  // Create user_tile_favorites table
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
    CREATE INDEX IF NOT EXISTS idx_layout_tiles_layout_id ON layout_tiles(layout_id);
    CREATE INDEX IF NOT EXISTS idx_layout_tiles_tile_id ON layout_tiles(tile_id);
    CREATE INDEX IF NOT EXISTS idx_pages_layout_id ON pages(layout_id);
    CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
  `);

  console.log('Database initialized successfully');
}

// Initialize on module load
initDatabase();

export default db;