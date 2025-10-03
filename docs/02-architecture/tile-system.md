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

### Workflow Examples

#### Creating a Tile Template
```
User creates tile in library → Saved as template → Available for reuse
```

#### Adding Template to Layout
```
Select template → Create instance → Link to template → Add to layout
```

#### Customizing Instance
```
Edit instance properties → Mark as modified → Changes stay local to layout
```

#### Saving Instance as Template
```
Modified instance → Save to library → Create new template → Available for reuse
```

#### Copying Between Layouts
```
Select instance → Copy to new layout → Create new instance → Maintain relationships
```

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

  // NEW: Create from instance
  createTemplateFromInstance(instanceId: string): Promise<Template>;
}
```

**Implementation**: `lib/services/tileTemplateService.ts`

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
  createCustomInstance(data: CustomInstanceInput): Promise<Instance>;
  syncWithTemplate(instanceId: string): Promise<Instance>;
  saveAsTemplate(instanceId: string, templateData: TemplateInput): Promise<Template>;

  // Layout Operations
  getByLayout(layoutId: string): Promise<Instance[]>;
  getInstancesForLayout(layoutId: string): Promise<InstanceWithPositions[]>;
  moveToLayout(instanceId: string, targetLayoutId: string): Promise<Instance>;
  copyInstance(instanceId: string, targetLayoutId: string): Promise<Instance>;

  // Position Management
  updatePositions(layoutId: string, positions: PositionUpdate[]): Promise<void>;
  updateDisplaySettings(instanceId: string, settings: DisplaySettings): Promise<Instance>;

  // Resolution
  resolve(instanceId: string): Promise<ResolvedInstance>;
  getModifiedInstances(layoutId: string): Promise<Instance[]>;

  // Validation
  validate(instance: InstanceInput): ValidationResult;
}
```

**Implementation**: `lib/services/tileInstanceService.ts`

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

## Additional Services

### Chart-MCP Service (NEW)
AI-powered chart generation service.

```typescript
interface ChartMCPService {
  // Chart Generation
  generateCharts(options: GenerateOptions): Promise<ChartOption[]>;
  generateChartsWithProgress(
    options: GenerateOptions,
    onProgress: ProgressCallback
  ): Promise<{ charts: ChartOption[]; events: ProgressEvent[] }>;

  // Recommendations
  recommendFromDataset(datasetId: string): Promise<Recommendation[]>;

  // Health Check
  checkHealth(): Promise<{ available: boolean; version: string }>;
}
```

**Implementation**: `lib/services/chartMCP.ts`

**Features**:
- WebSocket connection for real-time progress
- REST API fallback
- 6-stage pipeline with progress events
- 15-minute response cache
- Intent-based generation

### Data Import Service (NEW)
Data transformation and tile generation from imported data.

```typescript
interface DataImportService {
  // Tile Generation from Data
  generateTileFromData(
    datasetId: string,
    chartType: string,
    options?: GenerateOptions
  ): Promise<TileConfig>;

  // Chart-specific transformers
  transformToLineData(dataset: Dataset, options: TransformOptions): ChartData;
  transformToBarData(dataset: Dataset, options: TransformOptions): ChartData;
  transformToPieData(dataset: Dataset, options: TransformOptions): ChartData;
  transformToScatterData(dataset: Dataset, options: TransformOptions): ChartData;
  transformToAreaData(dataset: Dataset, options: TransformOptions): ChartData;
}
```

**Implementation**: `lib/services/dataImportService.ts`

**Features**:
- Automatic column mapping
- Data aggregation
- Smart title generation
- Type-specific transformers

### Dataset Storage Service (NEW)
Dataset persistence and management.

```typescript
interface DatasetStorageService {
  // Storage Operations
  saveDataset(dataset: DatasetInput): Promise<string>;
  getDataset(datasetId: string): Promise<Dataset>;
  listDatasets(options?: ListOptions): Promise<DatasetListItem[]>;
  deleteDataset(datasetId: string): Promise<void>;

  // Quota Management
  getQuotaUsage(): Promise<QuotaInfo>;
  cleanupOldDatasets(keepCount: number): Promise<void>;

  // Sampling
  getSample(datasetId: string, options: SampleOptions): Promise<DataSample>;
}
```

**Implementation**: `lib/services/datasetStorage.ts`

**Features**:
- IndexedDB storage (client)
- Server storage (persistent)
- Compression (lz-string)
- Quota management

### CSV Parser Service (NEW)
CSV file parsing and validation.

```typescript
interface CSVParserService {
  // Parsing
  parse(file: File, options?: ParseOptions): Promise<ParseResult>;
  parseText(text: string, options?: ParseOptions): Promise<ParseResult>;

  // Auto-detection
  detectDelimiter(text: string): string;
  validateStructure(data: any[][]): ValidationResult;
}
```

**Implementation**: `lib/services/csvParser.ts`

### Column Mapper Service (NEW)
Column type detection and data profiling.

```typescript
interface ColumnMapperService {
  // Type Detection
  detectColumnTypes(data: any[][]): ColumnTypes;
  profileColumn(column: any[]): ColumnProfile;

  // Data Analysis
  analyzeDataQuality(data: any[][]): DataQualityMetrics;
  detectCorrelations(data: any[][], types: ColumnTypes): CorrelationMatrix;
}
```

**Implementation**: `lib/services/columnMapper.ts`

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

2. **Update Database Schema**
```typescript
// In lib/db/schema.ts
// Add new type to tile type enum if needed
```

3. **Create Renderer Component**
```typescript
// components/tiles/CustomTile.tsx
export function CustomTile({ config, data }: TileProps) {
  // Rendering logic
  return <div>...</div>;
}
```

4. **Add to Tile Registry**
```typescript
// lib/tileRegistry.ts
const tileTypes = {
  ...existingTypes,
  custom: {
    component: CustomTile,
    schema: newTileSchema,
    defaultConfig: { /* defaults */ }
  }
};
```

5. **Add Data Transformer (if needed)**
```typescript
// lib/services/dataImportService.ts
transformToCustomData(dataset: Dataset, options: TransformOptions): ChartData {
  // Transform logic
}
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