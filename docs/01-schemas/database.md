# Database Schema

## Overview
The dashboard system uses a relational database (SQLite) with JSON columns for flexible data storage. This document defines the complete database structure.

**Architecture Note:** The system now uses a template/instance pattern where:
- **Templates** are reusable tile definitions stored in the library
- **Instances** are actual tiles used within specific layouts
- **Layout positions** reference instances, not templates directly

## Tables

### tile_templates
Stores reusable tile definitions for the library.

```sql
CREATE TABLE tile_templates (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- Tile type identifier
  title TEXT NOT NULL,                   -- Display title
  name TEXT,                             -- User-friendly name for library
  description TEXT,                      -- Template description
  category TEXT,                         -- Category for organization
  tags TEXT,                             -- JSON array of tags
  is_system INTEGER DEFAULT 0,           -- System-provided template
  thumbnail TEXT,                        -- Preview image (base64/URL)
  owner_id TEXT,                         -- Creator ID
  is_public INTEGER DEFAULT 0,          -- Boolean: sharing permission
  usage_count INTEGER DEFAULT 0,        -- Popularity counter
  config TEXT NOT NULL,                 -- JSON: tile configuration
  data TEXT,                             -- JSON: static data
  content TEXT,                          -- JSON: type-specific content
  data_source TEXT,                      -- JSON: data source config
  default_display_settings TEXT,        -- JSON: default display settings
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tile_templates_type ON tile_templates(type);
CREATE INDEX idx_tile_templates_category ON tile_templates(category);
CREATE INDEX idx_tile_templates_owner ON tile_templates(owner_id);
CREATE INDEX idx_tile_templates_public ON tile_templates(is_public);
CREATE INDEX idx_tile_templates_system ON tile_templates(is_system);
```

### tile_instances
Stores actual tile instances used within layouts.

```sql
CREATE TABLE tile_instances (
  id TEXT PRIMARY KEY,
  template_id TEXT REFERENCES tile_templates(id) ON DELETE SET NULL,
  layout_id TEXT NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
  parent_instance_id TEXT,               -- For copied instances
  type TEXT NOT NULL,                    -- Tile type (denormalized)
  title TEXT NOT NULL,                   -- Instance title (can override template)
  config TEXT NOT NULL,                 -- JSON: instance configuration
  data TEXT,                             -- JSON: instance-specific data
  content TEXT,                          -- JSON: instance-specific content
  data_source TEXT,                      -- JSON: instance data source config
  display_settings TEXT,                -- JSON: layout-specific display settings
  is_modified INTEGER DEFAULT 0,        -- Whether instance differs from template
  last_synced_at INTEGER,               -- Last sync with template
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tile_instances_template ON tile_instances(template_id);
CREATE INDEX idx_tile_instances_layout ON tile_instances(layout_id);
CREATE INDEX idx_tile_instances_type ON tile_instances(type);
CREATE INDEX idx_tile_instances_parent ON tile_instances(parent_instance_id);
```

### tiles (Legacy - Deprecated)
**DEPRECATED:** Legacy table maintained for backward compatibility during migration.

```sql
-- This table structure is deprecated and will be removed after migration
-- See migration documentation for details
```

### layouts
Stores dashboard layout configurations.

```sql
CREATE TABLE layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- Layout name
  description TEXT,                      -- Layout description
  config TEXT,                           -- JSON: layout configuration
  is_default INTEGER DEFAULT 0,         -- Boolean: default flag
  is_shared INTEGER DEFAULT 0,          -- Boolean: shared flag
  owner_id TEXT,                         -- Creator ID
  tags TEXT,                             -- JSON array of tags
  metadata TEXT,                         -- JSON: additional metadata
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_layouts_owner ON layouts(owner_id);
CREATE INDEX idx_layouts_default ON layouts(is_default);
CREATE INDEX idx_layouts_shared ON layouts(is_shared);
```

### layout_tiles
Junction table linking layouts to tile instances with position data.

```sql
CREATE TABLE layout_tiles (
  layout_id TEXT NOT NULL,              -- Foreign key to layouts
  tile_instance_id TEXT NOT NULL,       -- Foreign key to tile_instances
  breakpoint TEXT NOT NULL,             -- Screen size: lg/md/sm/xs
  position TEXT NOT NULL,               -- JSON: grid position
  is_visible INTEGER DEFAULT 1,         -- Boolean: visibility
  inheritance_mode TEXT DEFAULT 'inherit', -- inherit/custom
  
  PRIMARY KEY (layout_id, tile_instance_id, breakpoint),
  FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE,
  FOREIGN KEY (tile_instance_id) REFERENCES tile_instances(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_layout_tiles_layout ON layout_tiles(layout_id);
CREATE INDEX idx_layout_tiles_instance ON layout_tiles(tile_instance_id);
```

### pages
Stores dashboard pages that reference layouts.

```sql
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- Page name
  slug TEXT NOT NULL UNIQUE,            -- URL slug
  layout_id TEXT NOT NULL,              -- Foreign key to layouts
  filters TEXT,                          -- JSON: page filters
  refresh_interval INTEGER,              -- Seconds between refresh
  access TEXT,                           -- JSON: access control
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (layout_id) REFERENCES layouts(id)
);

-- Indexes
CREATE UNIQUE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_layout ON pages(layout_id);
```

### user_template_favorites
Tracks user favorite templates.

```sql
CREATE TABLE user_template_favorites (
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, template_id),
  FOREIGN KEY (template_id) REFERENCES tile_templates(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_template_favorites_user ON user_template_favorites(user_id);
CREATE INDEX idx_template_favorites_template ON user_template_favorites(template_id);
```

### user_tile_favorites (Legacy - Deprecated)
**DEPRECATED:** Legacy table for backward compatibility. Use user_template_favorites instead.

```sql
-- This table structure is deprecated and will be removed after migration
```

## JSON Column Structures

### tile_templates.config / tile_instances.config
```json
{
  "type": "string",
  "title": "string",
  "subtitle": "string (optional)",
  "options": {
    // Type-specific options
  }
}
```

### tile_templates.content / tile_instances.content
```json
{
  // Text tiles
  "richText": "string",
  "format": "html | markdown",
  
  // Image tiles
  "imageUrl": "string",
  "caption": "string (optional)",
  "alt": "string (optional)",
  
  // Smart tiles
  "smartData": {}
}
```

### tile_templates.data_source / tile_instances.data_source
```json
{
  "type": "api | database | static",
  "endpoint": "string (optional)",
  "query": "string (optional)",
  "refreshInterval": "number (optional)",
  "headers": {},
  "method": "GET | POST",
  "body": {}
}
```

### tile_templates.default_display_settings / tile_instances.display_settings
```json
{
  "showBorder": true,
  "borderColor": "#e2e8f0",
  "borderWidth": 1,
  "expandable": true,
  "showTitle": true,
  "titlePosition": "top | bottom | hidden",
  "padding": 16,
  "backgroundColor": "#ffffff",
  "opacity": 1.0,
  "interactive": true,
  "locked": false
}
```

### layouts.config
```json
{
  "cols": {
    "lg": 12,
    "md": 10,
    "sm": 6,
    "xs": 4
  },
  "rowHeight": 80,
  "compactType": "vertical | horizontal | null",
  "preventCollision": false
}
```

### layout_tiles.position
```json
{
  "x": 0,
  "y": 0,
  "w": 4,
  "h": 3,
  "minW": 2,
  "minH": 2,
  "maxW": 12,
  "maxH": 10,
  "static": false
}
```

### pages.filters
```json
{
  "dateRange": {
    "start": "ISO 8601 date",
    "end": "ISO 8601 date"
  },
  "categories": ["string"],
  "customFilters": {}
}
```

### pages.access
```json
{
  "public": true,
  "roles": ["admin", "viewer"],
  "users": ["user-id-1", "user-id-2"]
}
```

## Data Types

### SQLite Type Mappings
- `TEXT`: String data
- `INTEGER`: Numbers and booleans (0/1)
- `REAL`: Floating point numbers
- JSON data stored as `TEXT` with JSON validation

### Timestamp Format
- Stored as INTEGER (Unix timestamp)
- Automatically set on insert/update via triggers

## Constraints

### Foreign Key Constraints
- `tile_instances.template_id` → `tile_templates.id` (SET NULL)
- `tile_instances.layout_id` → `layouts.id` (CASCADE DELETE)
- `layout_tiles.layout_id` → `layouts.id` (CASCADE DELETE)
- `layout_tiles.tile_instance_id` → `tile_instances.id` (CASCADE DELETE)
- `pages.layout_id` → `layouts.id`
- `user_template_favorites.template_id` → `tile_templates.id` (CASCADE DELETE)

### Unique Constraints
- `tile_templates.id` (PRIMARY KEY)
- `tile_instances.id` (PRIMARY KEY)
- `layouts.id` (PRIMARY KEY)
- `pages.id` (PRIMARY KEY)
- `pages.slug` (UNIQUE)
- `(layout_id, tile_instance_id, breakpoint)` in layout_tiles
- `(user_id, template_id)` in user_template_favorites

## Migration Strategy

### Version Control
```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);
```

### Adding New Columns
```sql
-- Example: Adding content field to tiles
ALTER TABLE tiles ADD COLUMN content TEXT;
```

### Data Migration
1. Create new column with NULL allowed
2. Populate data via UPDATE statements
3. Add NOT NULL constraint if required
4. Update application code
5. Create indexes as needed

## Performance Considerations

### Indexing Strategy
- Index foreign keys for JOIN performance
- Index commonly filtered columns (type, category, owner_id)
- Composite index on layout_tiles primary key
- Unique index on pages.slug for fast lookups

### Query Optimization
- Use prepared statements
- Batch INSERT/UPDATE operations
- Lazy load JSON fields when not needed
- Consider pagination for large result sets

## Backup and Recovery

### Backup Strategy
```bash
# SQLite backup
sqlite3 dashboard.db ".backup backup.db"

# Export as SQL
sqlite3 dashboard.db .dump > backup.sql
```

### Recovery
```bash
# Restore from backup
sqlite3 dashboard.db < backup.sql
```

## Future Considerations

### Potential Tables
- `tile_template_versions`: Version history for templates
- `tile_instance_history`: Track instance changes
- `layout_history`: Track layout changes
- `user_preferences`: User-specific settings
- `audit_log`: Track all database changes

### Scalability
- Consider PostgreSQL for production
- Implement read replicas for scaling
- Add caching layer (Redis)
- Consider NoSQL for large JSON data

## Template/Instance Migration

This database schema represents the new template/instance architecture. For systems migrating from the legacy tiles-only approach:

1. **Run Migration Script**: Execute `lib/db/migrate-to-template-instance.ts` to safely transform existing data
2. **Template Creation**: Existing tiles marked with `isTemplate=true` become templates
3. **Instance Creation**: Tiles used in layouts become instances, linked to templates where applicable
4. **Relationship Updates**: Layout positioning now references instances instead of tiles directly
5. **Favorites Migration**: User favorites are migrated to the new template favorites system

**Migration Path**: Legacy tables are preserved during migration for rollback safety. Remove after successful migration and testing.

See `TEMPLATE_INSTANCE_ARCHITECTURE.md` for detailed information about the new architecture.