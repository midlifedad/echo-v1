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

#### [tiles-api.md](03-api/tiles-api.md)
- CRUD operations for tiles
- Batch operations
- Import/export functionality
- Error handling patterns

#### [layouts-api.md](03-api/layouts-api.md)
- Layout management endpoints
- Tile positioning APIs
- Template system
- WebSocket events

## Key Concepts

### Tiles
Self-contained content units that can be:
- **Created** from various types (text, image, charts)
- **Positioned** within layouts
- **Configured** with type-specific settings
- **Rendered** based on their type
- **Reused** across multiple layouts

### Layouts
Spatial organization systems that:
- **Define** grid-based positioning
- **Adapt** to different screen sizes
- **Persist** tile arrangements
- **Support** inheritance and locking

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

## Implementation Checklist

When building a new dashboard system:

### ✅ Data Layer
- [ ] Set up database with schema
- [ ] Implement data models
- [ ] Create migration system
- [ ] Add seed data

### ✅ Core Services
- [ ] Tile CRUD operations
- [ ] Layout management
- [ ] Position calculations
- [ ] Data fetching

### ✅ API Layer
- [ ] RESTful endpoints
- [ ] Authentication/authorization
- [ ] Error handling
- [ ] Rate limiting

### ✅ Business Logic
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

## Related Documentation

- **[LAYOUT_ARCHITECTURE.md](LAYOUT_ARCHITECTURE.md)** - Original architecture specification (historical reference)
- **[../CLAUDE.md](../CLAUDE.md)** - Project-specific implementation notes
- **[../TILE_SCHEMA_DOCUMENTATION.md](../TILE_SCHEMA_DOCUMENTATION.md)** - Detailed tile implementation guide

---

*This documentation represents the core system design. Implementation details may vary based on chosen technologies and specific requirements.*