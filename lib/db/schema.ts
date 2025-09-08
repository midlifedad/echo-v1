import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Layouts table - stores dashboard layout configurations
export const layouts = sqliteTable('layouts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  isShared: integer('is_shared', { mode: 'boolean' }).default(false),
  ownerId: text('owner_id'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  metadata: text('metadata', { mode: 'json' }).$type<{
    purpose?: string;
    theme?: string;
    version?: number;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Tiles table - stores individual tile/widget configurations
export const tiles = sqliteTable('tiles', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // Chart type: line, bar, pie, etc.
  title: text('title').notNull(),
  config: text('config', { mode: 'json' }).notNull().$type<{
    type: string;
    title: string;
    subtitle?: string;
    options: Record<string, any>;
  }>(),
  data: text('data', { mode: 'json' }).$type<Record<string, any>>(),
  dataSource: text('data_source', { mode: 'json' }).$type<{
    type: 'api' | 'database' | 'static';
    endpoint?: string;
    query?: string;
    refreshInterval?: number;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Layout-Tiles junction table - stores tile positions per layout and breakpoint
export const layoutTiles = sqliteTable('layout_tiles', {
  layoutId: text('layout_id').notNull().references(() => layouts.id, { onDelete: 'cascade' }),
  tileId: text('tile_id').notNull().references(() => tiles.id, { onDelete: 'cascade' }),
  breakpoint: text('breakpoint').notNull(), // lg, md, sm, xs
  position: text('position', { mode: 'json' }).notNull().$type<{
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
  }>(),
  isVisible: integer('is_visible', { mode: 'boolean' }).default(true),
  inheritanceMode: text('inheritance_mode').$type<'inherit' | 'custom'>().default('inherit'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.layoutId, table.tileId, table.breakpoint] }),
  };
});

// Pages table - stores dashboard pages that reference layouts
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  layoutId: text('layout_id').notNull().references(() => layouts.id),
  filters: text('filters', { mode: 'json' }).$type<{
    dateRange?: { start: Date; end: Date };
    categories?: string[];
    customFilters?: Record<string, any>;
  }>(),
  refreshInterval: integer('refresh_interval'), // in seconds
  access: text('access', { mode: 'json' }).$type<{
    public: boolean;
    roles?: string[];
    users?: string[];
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Type exports for use in application
export type Layout = typeof layouts.$inferSelect;
export type NewLayout = typeof layouts.$inferInsert;
export type Tile = typeof tiles.$inferSelect;
export type NewTile = typeof tiles.$inferInsert;
export type LayoutTile = typeof layoutTiles.$inferSelect;
export type NewLayoutTile = typeof layoutTiles.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;