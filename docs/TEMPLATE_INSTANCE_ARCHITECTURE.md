# Template/Instance Architecture

## Overview
We've restructured the tile system to use a template/instance pattern that clearly separates reusable tile templates (library) from tile instances (used in layouts). This provides flexibility for customization while maintaining consistency and reusability.

## Key Concepts

### Tile Templates (Library)
- **Purpose**: Reusable tile definitions stored in the library
- **Table**: `tile_templates`
- **Characteristics**:
  - Shareable across users (if public)
  - Can be favorited by users
  - Track usage statistics
  - Have default display settings
  - Can be system-provided or user-created

### Tile Instances
- **Purpose**: Actual tiles used within layouts
- **Table**: `tile_instances`
- **Characteristics**:
  - Belong to a specific layout
  - Can be linked to a template or be custom
  - Have their own display settings
  - Can override template properties
  - Track modification status

### Display Settings
Each tile instance can have customized display settings within its layout:
```typescript
interface TileDisplaySettings {
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
}
```

## Workflow

### 1. Creating a Tile Template
```
User creates tile in library → Saved as template → Available for reuse
```

### 2. Adding Template to Layout
```
Select template → Create instance → Link to template → Add to layout
```

### 3. Customizing Instance
```
Edit instance properties → Mark as modified → Changes stay local to layout
```

### 4. Saving Instance as Template
```
Modified instance → Save to library → Create new template → Available for reuse
```

### 5. Copying Between Layouts
```
Select instance → Copy to new layout → Create new instance → Maintain relationships
```

## Database Schema

### Core Tables

#### tile_templates
- Stores reusable tile definitions
- Includes metadata like category, tags, thumbnail
- Tracks usage and popularity
- Has default display settings

#### tile_instances
- Stores actual tiles used in layouts
- Links to template (optional)
- Has layout-specific display settings
- Tracks modification status

#### layout_tiles
- Junction table for positioning
- References tile instances (not templates)
- Stores position per breakpoint

## Implementation Status

### ✅ Completed
1. **Database Schema** - New table structure with template/instance pattern
2. **TypeScript Types** - Complete type definitions for new structure
3. **Migration Script** - Safe migration from old to new schema

### 🔄 Pending
1. **TileService** - Update for instance management
2. **LayoutService** - Handle instance creation and copying
3. **API Endpoints** - Separate template and instance operations
4. **UI Components** - Refactor for new structure
5. **Documentation** - Update user-facing docs

## Benefits

1. **Separation of Concerns**
   - Templates are reusable definitions
   - Instances are layout-specific implementations

2. **Flexibility**
   - Customize tiles per layout without affecting templates
   - Different display settings for same content

3. **Reusability**
   - Share templates across layouts and users
   - Build a library of proven tile designs

4. **Traceability**
   - Track which instances come from which templates
   - Understand tile relationships and usage

5. **Consistency**
   - Templates ensure consistent starting points
   - Easy to update multiple instances from template

## Migration Path

The migration script (`lib/db/migrate-to-template-instance.ts`) handles:
1. Creating new tables
2. Converting existing tiles to templates/instances
3. Updating relationships
4. Preserving all data

## Next Steps

1. **Implement Services**: Update TileService and LayoutService
2. **Create APIs**: Build endpoints for template/instance operations
3. **Update UI**: Refactor components to use new structure
4. **Add Features**:
   - Template gallery/marketplace
   - Instance synchronization with templates
   - Bulk operations
   - Version control for templates

## Example Use Cases

### Text Tile in Multiple Layouts
- Create text tile template with company description
- Add to multiple dashboard layouts
- Customize border/padding per layout
- Update template to update all instances (optional sync)

### Custom Chart per Department
- Start with revenue chart template
- Create instances for each department
- Customize colors/filters per instance
- Each department sees their specific view

### Locked Template Tiles
- Admin creates system templates
- Users can add but not modify core properties
- Display settings still customizable
- Ensures consistency for critical metrics