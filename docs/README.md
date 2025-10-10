# Dashboard System Documentation

## Purpose
This documentation describes the core architecture and data structures of the dashboard system. It is designed to be **UI-agnostic** - focusing on schemas, APIs, and system design that can be reused regardless of the presentation layer.

## Quick Start for Rebuilding

If you're rebuilding the dashboard from scratch, start here:

1. **[Database Schema](01-schemas/database.md)** - Set up your data layer
2. **[Tile Schemas](01-schemas/tiles.md)** - Understand content types
3. **[Layout Schemas](01-schemas/layouts.md)** - Implement positioning system
4. **[Tiles API](03-api/tiles-api.md)** - Build the tile endpoints
5. **[Layouts API](03-api/layouts-api.md)** - Build the layout endpoints

## Documentation Structure

### 📊 01-schemas/
Core data structures that define the system.

#### [tiles.md](01-schemas/tiles.md)
- All tile types and their schemas
- Content structures for text, image, and chart tiles
- Validation rules and constraints
- Type definitions and unions

#### [layouts.md](01-schemas/layouts.md)
- Layout configuration schemas
- Grid positioning system
- Breakpoint definitions
- Inheritance and locking mechanisms

#### [database.md](01-schemas/database.md)
- Complete SQL schema
- Table structures and relationships
- JSON column definitions
- Migration strategies

### 🏗️ 02-architecture/
How the system components work together.

#### [tile-system.md](02-architecture/tile-system.md)
- Tile lifecycle (creation → rendering → deletion)
- Type registry and plugin architecture
- Rendering pipeline
- Extension patterns for new tile types

#### [layout-system.md](02-architecture/layout-system.md)
- Grid calculation engine
- Responsive breakpoint system
- Collision detection and resolution
- Drag and drop mechanics

#### [data-flow.md](02-architecture/data-flow.md)
- Data source patterns (static, dynamic, computed)
- Transformation pipelines
- Caching strategies
- Real-time update mechanisms

### 🔌 03-api/
RESTful API contracts for system interaction.

#### [templates-api.md](03-api/templates-api.md)
- Template library management
- CRUD operations for reusable tile templates
- Favorites and usage tracking
- Import/export functionality

#### [instances-api.md](03-api/instances-api.md)
- Instance management within layouts
- Template linking and synchronization
- Layout-specific customization
- Bulk operations

#### [layouts-api.md](03-api/layouts-api.md)
- Layout management endpoints
- Instance positioning APIs
- Template system
- WebSocket events

#### [chart-mcp-api.md](03-api/chart-mcp-api.md)
- Chart-MCP integration endpoints
- AI-powered chart generation (REST + WebSocket)
- Real-time progress updates
- Chart recommendations from datasets
- Caching and rate limiting

#### [datasets-api.md](03-api/datasets-api.md)
- Data import endpoints
- CSV file upload and paste data
- Dataset storage and management
- Column statistics and profiling
- Storage quota management

## Key Concepts

### Template/Instance Architecture
The system uses a two-tier approach for flexibility and reusability:

#### Templates
Reusable tile definitions stored in the library that can be:
- **Created** from various types (text, image, charts)
- **Shared** across users and layouts
- **Favorited** by users
- **Tracked** for usage statistics
- **Configured** with default display settings

#### Instances
Actual tiles used within layouts that can be:
- **Linked** to templates or exist independently
- **Positioned** within specific layouts
- **Customized** with layout-specific settings
- **Synchronized** with their source templates
- **Modified** independently from templates

### Layouts
Spatial organization systems that:
- **Define** grid-based positioning for instances
- **Adapt** to different screen sizes
- **Persist** instance arrangements
- **Support** inheritance and locking
- **Reference** instances, not templates directly

### Data Flow
Information movement that:
- **Sources** from multiple origins
- **Transforms** through pipelines
- **Caches** for performance
- **Updates** in real-time

## Design Principles

1. **Separation of Concerns**
   - Data layer independent of presentation
   - Business logic isolated from UI
   - API contracts define boundaries

2. **Extensibility**
   - Plugin architecture for new tile types
   - Configurable grid system
   - Flexible data sources

3. **Reusability**
   - Tiles usable across layouts
   - Layouts shareable between users
   - Templates for common patterns

4. **Performance**
   - Lazy loading strategies
   - Efficient caching layers
   - Optimized rendering pipelines

## Template/Instance Migration

This documentation reflects the new template/instance architecture. For systems migrating from legacy tile-only structures:

### Migration Process
1. **Run Migration Script**: Execute `lib/db/migrate-to-template-instance.ts`
2. **Template Creation**: Existing tiles marked as templates become reusable library items
3. **Instance Generation**: Tiles used in layouts become instances, linked to templates where applicable
4. **Relationship Updates**: Layout positioning references instances instead of tiles
5. **Data Preservation**: All existing data and relationships are maintained
6. **Rollback Safety**: Legacy tables preserved during migration for rollback capability

### New API Structure
- **Templates**: `/api/templates` - Library management
- **Instances**: `/api/instances` - Layout-specific tile management
- **Legacy**: Original `/api/tiles` endpoints deprecated but preserved for compatibility

The migration script (`lib/db/migrate-to-template-instance.ts`) handles all necessary transformations automatically.

## Implementation Status

### ✅ Completed (100%)
- **Database Schema** - SQLite with Drizzle ORM, template/instance pattern
- **TypeScript Types** - Complete type system (6 type files)
- **Migration Script** - Safe migration from old to new schema
- **Template API** - Full CRUD operations for templates
- **Instance API** - Instance management endpoints
- **Service Layer** - 9 comprehensive services (Templates, Instances, Layouts, Chart-MCP, DataImport, etc.)
- **UI Components** - React components for all core features
- **Chart-MCP Integration** - WebSocket + REST API for AI chart generation
- **Data Import System** - CSV upload, paste data, column mapping, dataset storage
- **API Endpoints** - 19+ REST endpoints fully implemented
- **Documentation** - Complete technical documentation

### 🔄 In Progress
- Template marketplace/gallery
- User authentication and authorization
- Collaborative editing (multi-user)

### 📋 Planned Features
- Template versioning and rollback
- Advanced data connectors
- Real-time collaboration
- Mobile app

## Implementation Checklist

When building a new dashboard system:

### ✅ Data Layer
- [ ] Set up database with schema
- [ ] Implement data models
- [ ] Create migration system
- [ ] Add seed data

### ✅ Core Services
- [ ] Template library management
- [ ] Instance CRUD operations
- [ ] Layout management
- [ ] Position calculations
- [ ] Template/instance resolution
- [ ] Data fetching

### ✅ API Layer
- [ ] Template endpoints (/api/templates)
- [ ] Instance endpoints (/api/instances) 
- [ ] Layout endpoints (updated for instances)
- [ ] Authentication/authorization
- [ ] Error handling
- [ ] Rate limiting

### ✅ Business Logic
- [ ] Template/instance relationship handling
- [ ] Display settings inheritance
- [ ] Instance modification tracking
- [ ] Template synchronization
- [ ] Tile type registry
- [ ] Rendering pipeline
- [ ] Grid calculations
- [ ] Collision detection

### ✅ Optional Features
- [ ] Real-time updates
- [ ] Import/export
- [ ] Templates
- [ ] Collaboration

## Technology Agnostic

This documentation intentionally avoids:
- Specific UI frameworks (React, Vue, etc.)
- Styling systems (CSS, Tailwind, etc.)
- Component libraries
- Browser-specific APIs

Instead, it focuses on:
- Data structures
- Business logic
- System architecture
- API contracts

## Extending the System

### Adding New Tile Types
1. Define schema in [tiles.md](01-schemas/tiles.md)
2. Update database schema
3. Create renderer interface
4. Register with type system
5. Add API endpoints

### Adding New Features
1. Design data structure
2. Update relevant schemas
3. Define API contract
4. Document architecture
5. Implement business logic

## Migration Path

If migrating from an existing system:

1. **Analyze** current data structures
2. **Map** to new schemas
3. **Transform** existing data
4. **Validate** against new schemas
5. **Import** into new system
6. **Verify** functionality

## Questions to Answer

Before rebuilding, consider:

- What tile types do you need?
- How many breakpoints for responsive design?
- What data sources will you support?
- Do you need real-time updates?
- Will layouts be shared between users?
- What performance targets do you have?

### 🎯 04-features/
Feature-specific guides and tutorials.

#### [ai-chart-generation.md](04-features/ai-chart-generation.md)
- Chart-MCP integration guide
- AI-powered chart generation workflows
- Intent-based and data-driven generation
- Real-time progress updates (6-stage pipeline)
- Configuration and preferences
- Error handling and troubleshooting
- Code examples and best practices

#### [data-import.md](04-features/data-import.md)
- Complete data import guide
- CSV upload and paste data workflows
- Column type detection and mapping
- Data profiling and quality assessment
- Storage (IndexedDB + server)
- Chart recommendations from data
- Multi-step wizard UI
- Best practices and optimization

## Quick Links

### Getting Started
- **[../QUICKSTART.md](../QUICKSTART.md)** - Get up and running in minutes
- **[../FEATURES.md](../FEATURES.md)** - Feature list and implementation status
- **[../CLAUDE.md](../CLAUDE.md)** - Complete developer guide

### Core Architecture
- **[01-schemas/database.md](01-schemas/database.md)** - Database schema
- **[02-architecture/tile-system.md](02-architecture/tile-system.md)** - Tile system architecture
- **[02-architecture/layout-system.md](02-architecture/layout-system.md)** - Layout system
- **[02-architecture/data-flow.md](02-architecture/data-flow.md)** - Data flow patterns

### API Documentation
- **[03-api/templates-api.md](03-api/templates-api.md)** - Templates API
- **[03-api/instances-api.md](03-api/instances-api.md)** - Instances API
- **[03-api/layouts-api.md](03-api/layouts-api.md)** - Layouts API
- **[03-api/chart-mcp-api.md](03-api/chart-mcp-api.md)** - Chart-MCP API
- **[03-api/datasets-api.md](03-api/datasets-api.md)** - Datasets API

### Feature Guides
- **[04-features/ai-chart-generation.md](04-features/ai-chart-generation.md)** - AI chart generation
- **[04-features/data-import.md](04-features/data-import.md)** - Data import

## Related Documentation

- **[../CLAUDE.md](../CLAUDE.md)** - Project-specific implementation notes
- **[../QUICKSTART.md](../QUICKSTART.md)** - Quick start guide
- **[../FEATURES.md](../FEATURES.md)** - Feature list and status
- **[02-architecture/tile-system.md](02-architecture/tile-system.md)** - Complete tile system architecture with template/instance pattern
- **[01-schemas/tiles.md](01-schemas/tiles.md)** - Template and instance schema definitions

---

**Documentation Version**: 3.0.0
**Last Updated**: 2025-10-03
**Status**: Active Development

*This documentation represents the core system design and current implementation. All features marked as ✅ Completed are fully implemented and tested.*