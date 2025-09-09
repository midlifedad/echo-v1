# Tile System Architecture

## Overview
The tile system uses a template/instance architecture for creating, managing, and rendering diverse content types within dashboards. This provides flexibility for customization while maintaining consistency and reusability.

## Core Concepts

### Template/Instance Pattern
The system separates reusable definitions from their implementations:

- **Templates**: Reusable tile definitions stored in the library
  - Sharable across users and layouts
  - Have default display settings
  - Track usage statistics
  - Can be system-provided or user-created

- **Instances**: Actual tiles used within specific layouts
  - Linked to templates (optional)
  - Have layout-specific display settings
  - Can override template properties
  - Track modification status

### Tile Definition
Each template and instance is a self-contained content unit with:
- **Identity**: Unique identifier and metadata
- **Type**: Determines rendering and behavior  
- **Configuration**: Type-specific settings
- **Content**: The actual data to display
- **Display Settings**: Layout-specific presentation options
- **State**: Runtime state and lifecycle

### Tile Types
The system supports multiple tile types through a plugin-like architecture:
- **Content Tiles**: Text, images, media
- **Data Tiles**: Charts, metrics, tables
- **Interactive Tiles**: Forms, controls
- **Smart Tiles**: AI-enhanced content (future)

## Template/Instance Lifecycle

### Template Lifecycle

#### 1. Template Creation
```
Type Selection → Configuration → Default Settings → Validation → Library Storage
```

**Steps:**
1. User selects tile type
2. System loads type-specific configuration interface
3. User provides required data and default display settings
4. System validates against type schema
5. Template saved to library database

#### 2. Template Management
- Templates can be favorited by users
- Usage statistics are tracked
- Templates can be shared (public/private)
- Templates can be updated (affects future instances)

### Instance Lifecycle

#### 1. Instance Creation
```
Template Selection → Layout Assignment → Customization → Validation → Storage
```

**Steps:**
1. User selects template from library (or creates custom)
2. Instance created and assigned to specific layout
3. User customizes display settings and content (optional)
4. System validates instance configuration
5. Instance saved with layout relationship

#### 2. Instance Loading
```
Layout Query → Fetch Instances → Template Resolution → Hydration → Ready
```

**Steps:**
1. System queries instances for layout
2. Fetches instance and template data from database
3. Resolves template inheritance and overrides
4. Hydrates with runtime configuration
5. Instance ready for rendering

### 3. Rendering
```
Type Router → Renderer Selection → Content Processing → Display
```

**Pipeline:**
```typescript
interface RenderPipeline {
  route(tile: Tile): Renderer;
  process(content: any): ProcessedContent;
  render(processed: ProcessedContent): Output;
  handleError(error: Error): Fallback;
}
```

### 4. Updates
```
Change Detection → Validation → Persistence → Re-render
```

**Update Flow:**
1. Detect content/config changes
2. Validate against type schema
3. Persist to database
4. Trigger re-render
5. Update dependent tiles

### 5. Deletion
```
Confirmation → Cleanup → Database Delete → Layout Update
```

## Type Registry

The system maintains a registry of available tile types:

```typescript
interface TileTypeRegistry {
  types: Map<string, TileTypeDefinition>;
  
  register(type: TileTypeDefinition): void;
  get(type: string): TileTypeDefinition;
  validate(type: string, data: any): ValidationResult;
  getRenderer(type: string): Renderer;
}

interface TileTypeDefinition {
  type: string;
  label: string;
  description: string;
  schema: Schema;
  renderer: Renderer;
  editor: Editor;
  validator: Validator;
  defaultConfig: any;
}
```

## Content Processing

### Text Tiles
```
Raw Text → Format Detection → Sanitization → Rendering
```
- Support HTML and Markdown
- XSS protection via sanitization
- Rich text editing capabilities

### Image Tiles
```
URL → Validation → Loading → Optimization → Display
```
- URL validation
- Lazy loading support
- Error fallbacks
- Responsive sizing

### Chart Tiles
```
Data → Transformation → Configuration → Visualization
```
- Data normalization
- Configuration merging
- Responsive charting
- Real-time updates

## Data Management

### Static Data
- Stored directly in tile record
- Immediate availability
- No external dependencies
- Version controlled with tile

### Dynamic Data
```typescript
interface DataSource {
  type: 'api' | 'database' | 'computed';
  fetch(): Promise<Data>;
  subscribe(callback: DataCallback): Unsubscribe;
  cache?: CacheConfig;
}
```

### Data Flow
```
Source → Fetch → Transform → Cache → Render
```

## Template/Instance Relationships

### Template Inheritance
```typescript
interface InstanceResolution {
  // Base template properties
  template: Template;
  
  // Instance overrides
  instance: Instance;
  
  // Resolved final properties
  resolved: {
    config: ResolvedConfig;
    content: ResolvedContent;
    displaySettings: ResolvedDisplaySettings;
  };
}
```

### Resolution Priority (highest to lowest)
1. Instance-specific overrides
2. Template defaults
3. System defaults

### Synchronization
- **Modified instances**: Track changes vs template
- **Sync operation**: Revert instance to template state
- **Template updates**: Optionally propagate to instances

## Template/Instance Services

### Template Service Interface
```typescript
interface TemplateService {
  // CRUD Operations
  create(template: TemplateInput): Promise<Template>;
  read(id: string): Promise<Template>;
  update(id: string, changes: Partial<Template>): Promise<Template>;
  delete(id: string): Promise<void>;
  
  // Library Operations
  list(filter?: TemplateFilter): Promise<Template[]>;
  search(query: string): Promise<Template[]>;
  getCategories(): Promise<Category[]>;
  
  // Favorites
  addToFavorites(templateId: string, userId: string): Promise<void>;
  removeFromFavorites(templateId: string, userId: string): Promise<void>;
  
  // Usage tracking
  incrementUsage(templateId: string): Promise<void>;
  getUsageStats(templateId: string): Promise<UsageStats>;
}
```

### Instance Service Interface
```typescript
interface InstanceService {
  // CRUD Operations
  create(instance: InstanceInput): Promise<Instance>;
  read(id: string): Promise<Instance>;
  update(id: string, changes: Partial<Instance>): Promise<Instance>;
  delete(id: string): Promise<void>;
  
  // Template Operations
  createFromTemplate(templateId: string, layoutId: string): Promise<Instance>;
  syncWithTemplate(instanceId: string): Promise<Instance>;
  saveAsTemplate(instanceId: string, templateData: TemplateInput): Promise<Template>;
  
  // Layout Operations
  getByLayout(layoutId: string): Promise<Instance[]>;
  moveToLayout(instanceId: string, targetLayoutId: string): Promise<Instance>;
  duplicate(instanceId: string, targetLayoutId?: string): Promise<Instance>;
  
  // Resolution
  resolve(instanceId: string): Promise<ResolvedInstance>;
  
  // Validation
  validate(instance: InstanceInput): ValidationResult;
}
```

## Rendering Architecture

### Renderer Interface
```typescript
interface TileRenderer {
  type: string;
  render(tile: Tile, context: RenderContext): Output;
  update(tile: Tile, changes: Changes): Output;
  destroy(): void;
}

interface RenderContext {
  mode: 'view' | 'edit' | 'preview';
  size: { width: number; height: number };
  theme: Theme;
  permissions: Permissions;
}
```

### Rendering Pipeline
1. **Type Resolution**: Determine renderer based on tile type
2. **Content Preparation**: Process and sanitize content
3. **Context Injection**: Provide runtime context
4. **Error Boundary**: Catch and handle rendering errors
5. **Output Generation**: Produce final rendered output

## Extension Patterns

### Adding New Tile Types

1. **Define Schema**
```typescript
const newTileSchema = {
  type: 'custom',
  content: {
    required: ['data'],
    properties: {
      data: { type: 'object' }
    }
  }
};
```

2. **Create Renderer**
```typescript
class CustomTileRenderer implements TileRenderer {
  render(tile: Tile, context: RenderContext) {
    // Rendering logic
  }
}
```

3. **Register Type**
```typescript
registry.register({
  type: 'custom',
  schema: newTileSchema,
  renderer: new CustomTileRenderer()
});
```

## Performance Optimization

### Lazy Loading
- Load tile renderers on demand
- Defer non-visible tile rendering
- Progressive content loading

### Caching Strategy
```typescript
interface TileCa"che {
  // Content caching
  content: LRUCache<string, Content>;
  
  // Rendered output caching
  rendered: WeakMap<Tile, Output>;
  
  // Configuration caching
  config: Map<string, Config>;
}
```

### Update Batching
- Batch multiple tile updates
- Debounce rapid changes
- Optimize re-render cycles

## Error Handling

### Error Types
1. **Validation Errors**: Invalid data/configuration
2. **Rendering Errors**: Renderer failures
3. **Data Errors**: Failed data fetching
4. **Permission Errors**: Unauthorized access

### Error Recovery
```typescript
interface ErrorHandler {
  handle(error: TileError): Recovery;
  fallback(tile: Tile): FallbackContent;
  report(error: TileError): void;
}
```

## Security Considerations

### Content Sanitization
- HTML sanitization for text tiles
- URL validation for images
- Script injection prevention
- Content Security Policy compliance

### Permission Model
```typescript
interface TilePermissions {
  canView(tile: Tile, user: User): boolean;
  canEdit(tile: Tile, user: User): boolean;
  canDelete(tile: Tile, user: User): boolean;
  canShare(tile: Tile, user: User): boolean;
}
```

## Testing Strategy

### Unit Testing
- Type validators
- Renderers
- Service methods
- Error handlers

### Integration Testing
- Full lifecycle tests
- Type registration
- Data flow
- Error recovery

### Performance Testing
- Render performance
- Memory usage
- Cache effectiveness
- Update efficiency