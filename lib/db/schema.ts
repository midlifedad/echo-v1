import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Layouts table - stores dashboard layout configurations
export const layouts = sqliteTable('layouts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  config: text('config', { mode: 'json' }).$type<{
    cols?: { lg: number; md: number; sm: number; xs: number };
    rowHeight?: number;
    compactType?: 'vertical' | 'horizontal' | null;
    preventCollision?: boolean;
  }>(),
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

// Tile Templates table - stores reusable tile templates (library)
export const tileTemplates = sqliteTable('tile_templates', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // Tile type: line, bar, pie, text, image, smart, etc.
  title: text('title').notNull(),
  name: text('name'), // User-friendly name for tile library
  description: text('description'), // What this tile shows
  category: text('category'), // e.g., 'sales', 'marketing', 'performance'
  tags: text('tags', { mode: 'json' }).$type<string[]>(), // For searching/filtering
  isSystem: integer('is_system', { mode: 'boolean' }).default(false), // System-provided templates
  thumbnail: text('thumbnail'), // Base64 preview image or URL
  ownerId: text('owner_id'), // Who created it
  isPublic: integer('is_public', { mode: 'boolean' }).default(false), // Shared across users
  usageCount: integer('usage_count').default(0), // Track popularity
  config: text('config', { mode: 'json' }).notNull().$type<{
    type: string;
    title: string;
    subtitle?: string;
    options: Record<string, any>;
  }>(),
  data: text('data', { mode: 'json' }).$type<Record<string, any>>(),
  content: text('content', { mode: 'json' }).$type<{
    // For text tiles
    richText?: string;
    format?: 'html' | 'markdown';
    // For image tiles
    imageUrl?: string;
    caption?: string;
    alt?: string;
    // For smart tiles
    smartData?: Record<string, any>;
  }>(),
  dataSource: text('data_source', { mode: 'json' }).$type<{
    type: 'api' | 'database' | 'static';
    endpoint?: string;
    query?: string;
    refreshInterval?: number;
  }>(),
  defaultDisplaySettings: text('default_display_settings', { mode: 'json' }).$type<{
    showBorder?: boolean;
    borderColor?: string;
    borderWidth?: number;
    expandable?: boolean;
    showTitle?: boolean;
    titlePosition?: 'top' | 'bottom' | 'hidden';
    padding?: number;
    backgroundColor?: string;
    opacity?: number;
    interactive?: boolean;
    locked?: boolean;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Tile Instances table - stores actual tile instances used in layouts
export const tileInstances = sqliteTable('tile_instances', {
  id: text('id').primaryKey(),
  templateId: text('template_id').references(() => tileTemplates.id, { onDelete: 'set null' }), // Nullable for custom tiles
  layoutId: text('layout_id').notNull().references(() => layouts.id, { onDelete: 'cascade' }),
  parentInstanceId: text('parent_instance_id'), // Track copy relationships
  
  // Instance-specific data (can override template values)
  type: text('type').notNull(),
  title: text('title').notNull(),
  config: text('config', { mode: 'json' }).notNull().$type<{
    type: string;
    title: string;
    subtitle?: string;
    options: Record<string, any>;
  }>(),
  data: text('data', { mode: 'json' }).$type<Record<string, any>>(),
  content: text('content', { mode: 'json' }).$type<{
    richText?: string;
    format?: 'html' | 'markdown';
    imageUrl?: string;
    caption?: string;
    alt?: string;
    smartData?: Record<string, any>;
  }>(),
  dataSource: text('data_source', { mode: 'json' }).$type<{
    type: 'api' | 'database' | 'static';
    endpoint?: string;
    query?: string;
    refreshInterval?: number;
  }>(),
  
  // Layout-specific display settings
  displaySettings: text('display_settings', { mode: 'json' }).$type<{
    showBorder?: boolean;
    borderColor?: string;
    borderWidth?: number;
    expandable?: boolean;
    showTitle?: boolean;
    titlePosition?: 'top' | 'bottom' | 'hidden';
    padding?: number;
    backgroundColor?: string;
    opacity?: number;
    interactive?: boolean;
    locked?: boolean;
  }>(),
  
  // Instance metadata
  isModified: integer('is_modified', { mode: 'boolean' }).default(false), // Has diverged from template
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }), // Last sync with template
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Layout-Tiles junction table - stores tile positions per layout and breakpoint
export const layoutTiles = sqliteTable('layout_tiles', {
  layoutId: text('layout_id').notNull().references(() => layouts.id, { onDelete: 'cascade' }),
  tileInstanceId: text('tile_instance_id').notNull().references(() => tileInstances.id, { onDelete: 'cascade' }),
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
    pk: primaryKey({ columns: [table.layoutId, table.tileInstanceId, table.breakpoint] }),
  };
});

// User Template Favorites table - stores user's favorite templates
export const userTemplateFavorites = sqliteTable('user_template_favorites', {
  userId: text('user_id').notNull(),
  templateId: text('template_id').notNull().references(() => tileTemplates.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.templateId] }),
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

// Legacy tiles table - kept for migration purposes (will be removed after migration)
export const tiles = sqliteTable('tiles', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  name: text('name'),
  description: text('description'),
  category: text('category'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  isTemplate: integer('is_template', { mode: 'boolean' }).default(false),
  thumbnail: text('thumbnail'),
  ownerId: text('owner_id'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  usageCount: integer('usage_count').default(0),
  config: text('config', { mode: 'json' }).notNull().$type<{
    type: string;
    title: string;
    subtitle?: string;
    options: Record<string, any>;
  }>(),
  data: text('data', { mode: 'json' }).$type<Record<string, any>>(),
  content: text('content', { mode: 'json' }).$type<{
    richText?: string;
    format?: 'html' | 'markdown';
    imageUrl?: string;
    caption?: string;
    alt?: string;
    smartData?: Record<string, any>;
  }>(),
  dataSource: text('data_source', { mode: 'json' }).$type<{
    type: 'api' | 'database' | 'static';
    endpoint?: string;
    query?: string;
    refreshInterval?: number;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Legacy user tile favorites - kept for migration
export const userTileFavorites = sqliteTable('user_tile_favorites', {
  userId: text('user_id').notNull(),
  tileId: text('tile_id').notNull().references(() => tiles.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.tileId] }),
  };
});

// Type exports for use in application
export type Layout = typeof layouts.$inferSelect;
export type NewLayout = typeof layouts.$inferInsert;

export type TileTemplate = typeof tileTemplates.$inferSelect;
export type NewTileTemplate = typeof tileTemplates.$inferInsert;

export type TileInstance = typeof tileInstances.$inferSelect;
export type NewTileInstance = typeof tileInstances.$inferInsert;

export type LayoutTile = typeof layoutTiles.$inferSelect;
export type NewLayoutTile = typeof layoutTiles.$inferInsert;

export type UserTemplateFavorite = typeof userTemplateFavorites.$inferSelect;
export type NewUserTemplateFavorite = typeof userTemplateFavorites.$inferInsert;

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

// Legacy types - kept for migration
export type Tile = typeof tiles.$inferSelect;
export type NewTile = typeof tiles.$inferInsert;
export type UserTileFavorite = typeof userTileFavorites.$inferSelect;
export type NewUserTileFavorite = typeof userTileFavorites.$inferInsert;