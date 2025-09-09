# Template/Instance Migration Guide

## Overview
This guide provides detailed instructions for migrating from the legacy tile-only architecture to the new template/instance pattern. The migration preserves all existing data while providing enhanced flexibility and reusability.

## Before You Begin

### Prerequisites
- Database backup completed
- Node.js environment configured
- Application dependencies installed
- Database write access available

### What Changes
- **Database Schema**: New tables for templates and instances
- **API Endpoints**: Separate endpoints for templates vs instances  
- **Data Relationships**: Layouts reference instances instead of tiles
- **Display Settings**: Enhanced customization per instance

### What Stays the Same
- All existing tile data and content
- Layout configurations and positioning
- User preferences and favorites
- Chart data and configurations

## Migration Process

### Step 1: Pre-Migration Assessment

#### Check Current Data
```bash
# Review existing tiles
npm run db:query "SELECT COUNT(*) as total_tiles FROM tiles"

# Check template usage
npm run db:query "SELECT COUNT(*) as templates FROM tiles WHERE is_template = 1"

# Review layout relationships
npm run db:query "SELECT COUNT(*) as positioned_tiles FROM layout_tiles"
```

#### Backup Database
```bash
# Create backup
cp dashboard.db dashboard_backup_$(date +%Y%m%d_%H%M%S).db

# Verify backup
ls -la dashboard_backup_*.db
```

### Step 2: Run Migration Script

#### Execute Migration
```bash
# Run the migration script
npm run migrate:template-instance

# Alternative: Run directly
node lib/db/migrate-to-template-instance.ts
```

#### Expected Output
```
Starting template/instance migration...
Found 45 existing tiles to migrate
Created 12 templates from tiles marked as templates
Created 156 instances for tiles used in layouts
Updated 156 layout tile relationships
Migrated 8 user favorites to template favorites
Created 3 orphan templates for unused tiles
Migration completed successfully!
```

### Step 3: Post-Migration Verification

#### Verify New Tables
```sql
-- Check new tables exist
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'tile_%';

-- Verify template count
SELECT COUNT(*) as template_count FROM tile_templates;

-- Verify instance count  
SELECT COUNT(*) as instance_count FROM tile_instances;

-- Check relationships
SELECT COUNT(*) as positioned_instances FROM layout_tiles;
```

#### Test Data Integrity
```bash
# Run data integrity checks
npm run verify:migration

# Check specific layout
npm run db:query "
SELECT 
  ti.title as instance_title,
  tt.title as template_title,
  ti.is_modified,
  ti.template_id IS NOT NULL as has_template
FROM tile_instances ti
LEFT JOIN tile_templates tt ON ti.template_id = tt.id
WHERE ti.layout_id = 'your-layout-id'
"
```

## New Architecture Overview

### Template Library Structure
```
Templates (tile_templates)
├── System Templates (is_system = true)
│   ├── Revenue Chart Template
│   ├── KPI Card Template
│   └── Status Widget Template
└── User Templates (is_system = false)
    ├── Custom Dashboard Header
    ├── Department Metrics
    └── Project Status Board
```

### Instance Relationships
```
Layout → Instances → Templates (optional)

Example:
Sales Dashboard
├── Q1 Revenue Instance → Revenue Chart Template
├── Team KPIs Instance → KPI Card Template  
└── Custom Notes Instance → (no template)
```

## API Migration

### Old API Pattern (Deprecated)
```javascript
// Legacy tiles API
GET /api/tiles              // All tiles
POST /api/tiles             // Create tile
PUT /api/tiles/:id          // Update tile
DELETE /api/tiles/:id       // Delete tile
```

### New API Pattern
```javascript
// Template library management
GET /api/templates          // Browse library
POST /api/templates         // Create template
PUT /api/templates/:id      // Update template
DELETE /api/templates/:id   // Delete template

// Layout instance management  
GET /api/instances?layoutId=123    // Get layout instances
POST /api/instances                // Create instance
PUT /api/instances/:id             // Update instance
POST /api/instances/:id/sync       // Sync with template
```

### Migration Code Examples

#### Before: Creating a Tile
```javascript
const newTile = await fetch('/api/tiles', {
  method: 'POST',
  body: JSON.stringify({
    type: 'text',
    title: 'Instructions',
    content: { richText: '<p>Welcome</p>' },
    isTemplate: true
  })
});
```

#### After: Creating Template + Instance
```javascript
// 1. Create reusable template
const template = await fetch('/api/templates', {
  method: 'POST', 
  body: JSON.stringify({
    type: 'text',
    title: 'Instructions Template',
    content: { richText: '<p>Welcome</p>' },
    defaultDisplaySettings: {
      showBorder: true,
      showTitle: true
    }
  })
});

// 2. Create instance in layout
const instance = await fetch('/api/instances', {
  method: 'POST',
  body: JSON.stringify({
    templateId: template.id,
    layoutId: 'dashboard-123',
    title: 'Welcome Instructions',  // Override template title
    displaySettings: {
      backgroundColor: '#f0f9ff'  // Layout-specific styling
    }
  })
});
```

## Common Migration Scenarios

### Scenario 1: Simple Tile Migration
**Before**: Basic tile used in one layout
```json
{
  "id": "tile-001",
  "type": "text", 
  "title": "Welcome Message",
  "content": {"richText": "<p>Hello</p>"}
}
```

**After**: Instance created (no template needed)
```json
{
  "id": "instance-001",
  "templateId": null,
  "layoutId": "layout-123",
  "type": "text",
  "title": "Welcome Message", 
  "content": {"richText": "<p>Hello</p>"},
  "isModified": true
}
```

### Scenario 2: Template Tile Migration
**Before**: Template tile used across layouts
```json
{
  "id": "tile-header",
  "type": "text",
  "title": "Standard Header",
  "isTemplate": true,
  "content": {"richText": "<h1>Dashboard</h1>"}
}
```

**After**: Template + Multiple Instances
```json
// Template
{
  "id": "template_tile-header", 
  "type": "text",
  "title": "Standard Header",
  "content": {"richText": "<h1>Dashboard</h1>"},
  "defaultDisplaySettings": {"showTitle": false}
}

// Instance 1
{
  "id": "instance_layout-1_tile-header",
  "templateId": "template_tile-header",
  "layoutId": "layout-1", 
  "title": "Sales Dashboard",
  "displaySettings": {"backgroundColor": "#fee2e2"}
}

// Instance 2  
{
  "id": "instance_layout-2_tile-header",
  "templateId": "template_tile-header",
  "layoutId": "layout-2",
  "title": "Marketing Dashboard", 
  "displaySettings": {"backgroundColor": "#dbeafe"}
}
```

## Rollback Procedure

If migration issues occur, you can rollback safely:

### Step 1: Stop Application
```bash
# Stop running services
npm run stop
pkill -f "npm run dev"
```

### Step 2: Restore Database
```bash
# Restore from backup
cp dashboard_backup_YYYYMMDD_HHMMSS.db dashboard.db

# Verify restoration
npm run db:query "SELECT COUNT(*) FROM tiles"
```

### Step 3: Clean Up (Optional)
```bash
# Remove new tables (if desired)
npm run db:query "DROP TABLE IF EXISTS tile_templates"
npm run db:query "DROP TABLE IF EXISTS tile_instances" 
npm run db:query "DROP TABLE IF EXISTS user_template_favorites"
```

## Troubleshooting

### Common Issues

#### Migration Script Fails
```bash
# Check for foreign key constraints
npm run db:query "PRAGMA foreign_keys"

# View migration errors
node lib/db/migrate-to-template-instance.ts 2>&1 | tee migration.log
```

#### Missing Relationships
```sql
-- Find orphaned instances
SELECT * FROM tile_instances 
WHERE template_id IS NOT NULL 
AND template_id NOT IN (SELECT id FROM tile_templates);

-- Find broken layout references
SELECT * FROM layout_tiles 
WHERE tile_instance_id NOT IN (SELECT id FROM tile_instances);
```

#### Performance Issues
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_instances_layout_template 
ON tile_instances(layout_id, template_id);

-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM tile_instances 
WHERE layout_id = 'layout-123';
```

### Recovery Commands

#### Re-run Partial Migration
```javascript
// Fix specific relationships
const fixLayoutTiles = async () => {
  // Custom repair logic
  const brokenRefs = await db.query(`
    SELECT * FROM layout_tiles 
    WHERE tile_instance_id NOT IN (SELECT id FROM tile_instances)
  `);
  
  for (const ref of brokenRefs) {
    // Create missing instance or fix reference
  }
};
```

## Post-Migration Tasks

### Update Application Code
1. Update API calls to use new endpoints
2. Modify template/instance handling logic  
3. Update UI components for new data structure
4. Test template synchronization features

### Database Maintenance
```sql
-- Clean up legacy tables (after verification)
DROP TABLE IF EXISTS tiles;
DROP TABLE IF EXISTS user_tile_favorites;
DROP TABLE IF EXISTS layout_tiles_old;

-- Optimize new tables
VACUUM;
ANALYZE;
```

### Documentation Updates
1. Update API documentation
2. Revise user guides for new template workflow
3. Document new instance customization features
4. Create template library guidelines

## Success Criteria

Migration is successful when:

- [ ] All existing tiles converted to templates/instances
- [ ] All layout positioning preserved
- [ ] User favorites migrated to new structure
- [ ] No data loss detected
- [ ] API endpoints respond correctly
- [ ] UI displays layouts properly
- [ ] Template library accessible
- [ ] Instance customization works
- [ ] Synchronization functionality active
- [ ] Performance remains acceptable

## Support Resources

- **Architecture Details**: [TEMPLATE_INSTANCE_ARCHITECTURE.md](TEMPLATE_INSTANCE_ARCHITECTURE.md)
- **Database Schema**: [01-schemas/database.md](01-schemas/database.md)
- **API Reference**: [03-api/templates-api.md](03-api/templates-api.md)
- **Migration Script**: `lib/db/migrate-to-template-instance.ts`

For additional support, review the migration logs and database integrity checks.