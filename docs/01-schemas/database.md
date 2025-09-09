# Database Schema

## Overview
The dashboard system uses a relational database (SQLite) with JSON columns for flexible data storage. This document defines the complete database structure.

## Tables

### tiles
Stores all tile definitions and configurations.

```sql
CREATE TABLE tiles (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- Tile type identifier
  title TEXT NOT NULL,                   -- Display title
  name TEXT,                             -- Reusable name
  description TEXT,                      -- Tile description
  category TEXT,                         -- Category for organization
  tags TEXT,                             -- JSON array of tags
  is_template INTEGER DEFAULT 0,         -- Boolean: template flag
  thumbnail TEXT,                        -- Preview image
  owner_id TEXT,                         -- Creator ID
  is_public INTEGER DEFAULT 0,          -- Boolean: public flag
  usage_count INTEGER DEFAULT 0,        -- Usage counter
  config TEXT NOT NULL,                 -- JSON: configuration
  data TEXT,                             -- JSON: static data
  content TEXT,                          -- JSON: type-specific content
  data_source TEXT,                      -- JSON: data source config
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tiles_type ON tiles(type);
CREATE INDEX idx_tiles_category ON tiles(category);
CREATE INDEX idx_tiles_owner ON tiles(owner_id);
CREATE INDEX idx_tiles_public ON tiles(is_public);
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
Junction table linking layouts to tiles with position data.

```sql
CREATE TABLE layout_tiles (
  layout_id TEXT NOT NULL,              -- Foreign key to layouts
  tile_id TEXT NOT NULL,                -- Foreign key to tiles
  breakpoint TEXT NOT NULL,             -- Screen size: lg/md/sm/xs
  position TEXT NOT NULL,               -- JSON: grid position
  is_visible INTEGER DEFAULT 1,         -- Boolean: visibility
  inheritance_mode TEXT DEFAULT 'inherit', -- inherit/custom
  
  PRIMARY KEY (layout_id, tile_id, breakpoint),
  FOREIGN KEY (layout_id) REFERENCES layouts(id) ON DELETE CASCADE,
  FOREIGN KEY (tile_id) REFERENCES tiles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_layout_tiles_layout ON layout_tiles(layout_id);
CREATE INDEX idx_layout_tiles_tile ON layout_tiles(tile_id);
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

### user_tile_favorites
Tracks user favorite tiles.

```sql
CREATE TABLE user_tile_favorites (
  user_id TEXT NOT NULL,
  tile_id TEXT NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, tile_id),
  FOREIGN KEY (tile_id) REFERENCES tiles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_favorites_user ON user_tile_favorites(user_id);
CREATE INDEX idx_favorites_tile ON user_tile_favorites(tile_id);
```

## JSON Column Structures

### tiles.config
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

### tiles.content
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

### tiles.data_source
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
- `layout_tiles.layout_id` → `layouts.id` (CASCADE DELETE)
- `layout_tiles.tile_id` → `tiles.id` (CASCADE DELETE)
- `pages.layout_id` → `layouts.id`
- `user_tile_favorites.tile_id` → `tiles.id` (CASCADE DELETE)

### Unique Constraints
- `tiles.id` (PRIMARY KEY)
- `layouts.id` (PRIMARY KEY)
- `pages.id` (PRIMARY KEY)
- `pages.slug` (UNIQUE)
- `(layout_id, tile_id, breakpoint)` in layout_tiles
- `(user_id, tile_id)` in user_tile_favorites

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
- `tile_versions`: Version history for tiles
- `layout_history`: Track layout changes
- `user_preferences`: User-specific settings
- `audit_log`: Track all database changes

### Scalability
- Consider PostgreSQL for production
- Implement read replicas for scaling
- Add caching layer (Redis)
- Consider NoSQL for large JSON data