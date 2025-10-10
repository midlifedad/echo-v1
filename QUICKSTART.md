# Echo Dashboard - Quick Start Guide

Get up and running with Echo Dashboard in minutes!

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **(Optional) Chart-MCP** for AI chart generation

## Installation

1. **Clone and Navigate**:
   ```bash
   cd echo-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database**:
   ```bash
   # Database is automatically created on first run
   # Or manually initialize:
   npm run db:setup  # If this script exists
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

### 1. Explore the Dashboard

On first load, you'll see:
- **Dashboard Home**: Main grid layout with sample tiles
- **Sidebar**: Navigation (collapse/expand with toggle)
- **Tile Library**: Browse and create tiles
- **Layout Editor**: Customize your dashboard layout

### 2. Create Your First Tile

**Option A: Using the Tile Library**

1. Click **Tile Library** in sidebar
2. Click **Create Tile** button
3. Choose tile type:
   - **Text**: Rich text content
   - **Image**: Display images
   - **Chart**: Various chart types (line, bar, pie, etc.)
4. Configure your tile
5. Click **Save to Library**

**Option B: AI Chart Generation** (requires Chart-MCP)

1. Go to **Tile Library**
2. Click **AI Chart Generator**
3. Describe what you want: _"Show quarterly revenue trends for 2024"_
4. Wait for generation (real-time progress shown)
5. Select from generated chart options
6. Customize and save

### 3. Add Tiles to Dashboard

1. In **Tile Library**, find your tile
2. Click **Add to Dashboard**
3. Select target layout (or use default)
4. Tile appears in your dashboard

### 4. Arrange Your Dashboard

1. Click **Edit Layout** button (top right)
2. **Drag** tiles to reposition
3. **Resize** tiles by dragging corners/edges
4. Click **Save Layout** when done

### 5. Import Data

1. Click **Import Data** (or navigate to data import page)
2. Choose method:
   - **Upload CSV**: Select a CSV file
   - **Paste Data**: Copy/paste from spreadsheet
3. Preview data and map columns
4. Get AI chart recommendations
5. Select chart type
6. Create tile from data

## Key Features

### Template System

**Templates** are reusable tile blueprints:
- Create once, use many times
- Share across layouts
- Track usage and popularity
- Mark as favorites

**Instances** are active tiles in layouts:
- Can link to templates
- Customize per-layout
- Track modifications
- Sync with template or go custom

### Multi-Breakpoint Layouts

Responsive design with 4 breakpoints:
- **lg** (≥1200px): 12 columns - Desktop
- **md** (≥996px): 10 columns - Tablet landscape
- **sm** (≥768px): 6 columns - Tablet portrait
- **xs** (<768px): 4 columns - Mobile

Each tile can have different positions/sizes per breakpoint!

### AI-Powered Features

With Chart-MCP integration:
- Natural language chart generation
- Real-time progress updates
- Multiple chart options
- Optimized variants
- Data-driven recommendations

## Common Workflows

### Workflow 1: Create & Reuse Template

```
1. Create tile in Tile Library
2. Configure as you want it
3. Save as template
4. Add to multiple layouts
5. Instances stay in sync with template
```

### Workflow 2: Import & Visualize Data

```
1. Import CSV or paste data
2. System profiles data automatically
3. Get AI chart recommendations
4. Select recommended chart
5. Tile created and added to layout
```

### Workflow 3: Customize Per-Layout

```
1. Add template to layout
2. Customize instance (colors, borders, etc.)
3. Instance marked as "modified"
4. Changes stay local to this layout
5. Other instances unaffected
```

### Workflow 4: Generate AI Chart

```
1. Open AI Chart Generator
2. Type intent: "visualize sales by region"
3. (Optional) Attach dataset
4. Watch pipeline progress (6 stages)
5. Review generated options
6. Select best chart
7. Save to library
```

## Configuration

### Grid Settings

Default configuration (`lib/constants.ts`):
```typescript
cols: { lg: 12, md: 10, sm: 6, xs: 4 }
rowHeight: 80  // pixels
margin: [10, 10]  // x, y margins
```

### Database

Located at: `data/dashboard.db`

Tables:
- `tile_templates` - Template library
- `tile_instances` - Active tiles
- `layouts` - Layout configs
- `layout_tile_positions` - Grid positions
- `pages` - Dashboard pages

### Chart-MCP (Optional)

To enable AI features:

1. Install Chart-MCP:
   ```bash
   npm install -g chart-mcp
   ```

2. Start service:
   ```bash
   chart-mcp serve --port 4000
   ```

3. Dashboard auto-connects to `http://localhost:4000`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `E` | Toggle Edit Mode |
| `Esc` | Exit Edit Mode |
| `/` | Focus Search |
| `Ctrl/Cmd + S` | Save Layout |

## Tips & Tricks

### Performance
- Use templates for repeated tiles (reduces DB queries)
- Delete unused datasets (frees IndexedDB quota)
- Clear browser cache if UI feels slow

### Organization
- Use categories to organize templates
- Tag templates for better discovery
- Favorite frequently-used templates

### Customization
- Each instance can have unique display settings
- Border colors, padding, backgrounds are per-instance
- Title visibility can toggle per-tile

### Data
- CSV files must have headers in first row
- UTF-8 encoding required
- Max dataset size: 10MB (configurable)
- IndexedDB quota: 50MB default (browser-dependent)

## Troubleshooting

### Tiles Not Appearing
- Check if instance exists in database
- Verify layout has positions for current breakpoint
- Try refreshing browser

### AI Generation Fails
- Verify Chart-MCP is running: `curl http://localhost:4000/health`
- Check browser console for WebSocket errors
- Try REST fallback if WebSocket fails

### Data Import Errors
- Verify CSV format (comma or tab-separated)
- Check file encoding (must be UTF-8)
- Ensure headers are in first row
- File size under 10MB

### Layout Changes Not Saving
- Check browser console for API errors
- Verify database file permissions
- Try clearing localStorage: `localStorage.clear()`

## Next Steps

- **[CLAUDE.md](../CLAUDE.md)**: Complete developer guide
- **[docs/](docs/)**: Technical documentation
- **[FEATURES.md](FEATURES.md)**: Feature list and status
- **[docs/03-api/](docs/03-api/)**: API documentation
- **[docs/04-features/](docs/04-features/)**: Feature guides

## Getting Help

- Check documentation in `docs/`
- Review code examples in `lib/services/`
- Inspect database: `sqlite3 data/dashboard.db`
- Check browser console for errors
- Review Chart-MCP logs if using AI features

## What's Next?

Now that you're set up:

1. **Explore**: Browse the tile library and built-in templates
2. **Create**: Make your first custom tile
3. **Import**: Try importing a CSV dataset
4. **Generate**: Use AI to create a chart (if Chart-MCP enabled)
5. **Customize**: Arrange your perfect dashboard layout

Happy dashboarding! 🎨📊
