import { db } from './index';
import { layouts, tiles, layoutTiles } from './schema';
import { nanoid } from 'nanoid';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    await db.delete(layoutTiles);
    await db.delete(tiles);
    await db.delete(layouts);

    // Create default layout
    const defaultLayoutId = nanoid();
    await db.insert(layouts).values({
      id: defaultLayoutId,
      name: 'Default Dashboard',
      description: 'Main dashboard layout',
      config: {
        cols: { lg: 12, md: 10, sm: 6, xs: 4 },
        rowHeight: 80,
        compactType: 'vertical',
        preventCollision: false,
      },
      isShared: true,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create sample tiles
    const tilesData = [
      {
        id: nanoid(),
        type: 'line',
        title: 'Revenue Trend',
        config: {
          type: 'line',
          title: 'Revenue Trend',
          options: {
            chart: { type: 'line' },
            series: [
              {
                name: 'Revenue',
                data: [30000, 35000, 32000, 38000, 40000, 42000, 45000, 48000, 52000, 55000, 58000, 60000]
              }
            ],
            xAxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
          }
        },
        data: null,
        dataSource: null,
      },
      {
        id: nanoid(),
        type: 'bar',
        title: 'Sales by Region',
        config: {
          type: 'bar',
          title: 'Sales by Region',
          options: {
            chart: { type: 'column' },
            series: [
              {
                name: 'Sales',
                data: [150, 230, 180, 290, 210]
              }
            ],
            xAxis: {
              categories: ['North', 'South', 'East', 'West', 'Central']
            }
          }
        },
        data: null,
        dataSource: null,
      },
      {
        id: nanoid(),
        type: 'pie',
        title: 'Market Share',
        config: {
          type: 'pie',
          title: 'Market Share',
          options: {
            chart: { type: 'pie' },
            series: [{
              name: 'Share',
              data: [
                { name: 'Product A', y: 35 },
                { name: 'Product B', y: 25 },
                { name: 'Product C', y: 20 },
                { name: 'Product D', y: 15 },
                { name: 'Other', y: 5 }
              ]
            }]
          }
        },
        data: null,
        dataSource: null,
      },
      {
        id: nanoid(),
        type: 'gauge',
        title: 'Performance Metric',
        config: {
          type: 'gauge',
          title: 'Performance Metric',
          options: {
            chart: { type: 'solidgauge' },
            series: [{
              name: 'Performance',
              data: [75]
            }],
            yAxis: {
              min: 0,
              max: 100,
              stops: [
                [0.1, '#DF5353'],
                [0.5, '#DDDF0D'],
                [0.9, '#55BF3B']
              ]
            }
          }
        },
        data: null,
        dataSource: null,
      },
      {
        id: nanoid(),
        type: 'area',
        title: 'Traffic Overview',
        config: {
          type: 'area',
          title: 'Traffic Overview',
          options: {
            chart: { type: 'area' },
            series: [
              {
                name: 'Visitors',
                data: [1000, 1200, 1100, 1400, 1600, 1500, 1800, 2000, 2200, 2100, 2400, 2600]
              },
              {
                name: 'Page Views',
                data: [3000, 3500, 3200, 3800, 4200, 4000, 4500, 5000, 5300, 5100, 5600, 6000]
              }
            ],
            xAxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
          }
        },
        data: null,
        dataSource: null,
      },
      {
        id: nanoid(),
        type: 'scatter',
        title: 'Correlation Analysis',
        config: {
          type: 'scatter',
          title: 'Correlation Analysis',
          options: {
            chart: { type: 'scatter' },
            series: [{
              name: 'Data Points',
              data: [[10, 20], [15, 30], [20, 25], [25, 40], [30, 35], [35, 50], [40, 45], [45, 60]]
            }]
          }
        },
        data: null,
        dataSource: null,
      }
    ];

    // Insert tiles with new fields
    const insertedTiles = await db.insert(tiles).values(
      tilesData.map(tile => ({
        ...tile,
        name: tile.title, // Use title as name for now
        description: `Sample ${tile.title.toLowerCase()} visualization`,
        category: tile.type === 'line' || tile.type === 'area' ? 'analytics' : 
                  tile.type === 'bar' || tile.type === 'pie' ? 'sales' : 'performance',
        tags: [tile.type, 'sample'],
        isTemplate: true,
        ownerId: 'system',
        isPublic: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    ).returning();

    // Create layout-tile relationships with positions
    const layoutTilePositions = [
      { tileIndex: 0, lg: { x: 0, y: 0, w: 6, h: 3 }, md: { x: 0, y: 0, w: 5, h: 3 }, sm: { x: 0, y: 0, w: 6, h: 3 }, xs: { x: 0, y: 0, w: 4, h: 3 } },
      { tileIndex: 1, lg: { x: 6, y: 0, w: 6, h: 3 }, md: { x: 5, y: 0, w: 5, h: 3 }, sm: { x: 0, y: 3, w: 6, h: 3 }, xs: { x: 0, y: 3, w: 4, h: 3 } },
      { tileIndex: 2, lg: { x: 0, y: 3, w: 4, h: 3 }, md: { x: 0, y: 3, w: 4, h: 3 }, sm: { x: 0, y: 6, w: 3, h: 3 }, xs: { x: 0, y: 6, w: 4, h: 3 } },
      { tileIndex: 3, lg: { x: 4, y: 3, w: 4, h: 3 }, md: { x: 4, y: 3, w: 3, h: 3 }, sm: { x: 3, y: 6, w: 3, h: 3 }, xs: { x: 0, y: 9, w: 4, h: 3 } },
      { tileIndex: 4, lg: { x: 8, y: 3, w: 4, h: 3 }, md: { x: 7, y: 3, w: 3, h: 3 }, sm: { x: 0, y: 9, w: 6, h: 3 }, xs: { x: 0, y: 12, w: 4, h: 3 } },
      { tileIndex: 5, lg: { x: 0, y: 6, w: 12, h: 3 }, md: { x: 0, y: 6, w: 10, h: 3 }, sm: { x: 0, y: 12, w: 6, h: 3 }, xs: { x: 0, y: 15, w: 4, h: 3 } },
    ];

    const layoutTilesData = [];
    for (const pos of layoutTilePositions) {
      const tile = insertedTiles[pos.tileIndex];
      for (const breakpoint of ['lg', 'md', 'sm', 'xs'] as const) {
        layoutTilesData.push({
          layoutId: defaultLayoutId,
          tileId: tile.id,
          breakpoint,
          position: pos[breakpoint],
          isVisible: true,
          inheritanceMode: 'inherit' as const,
        });
      }
    }

    await db.insert(layoutTiles).values(layoutTilesData);

    // Create a second layout (Analytics Dashboard)
    const analyticsLayoutId = nanoid();
    await db.insert(layouts).values({
      id: analyticsLayoutId,
      name: 'Analytics Dashboard',
      description: 'Focused analytics view',
      config: {
        cols: { lg: 12, md: 10, sm: 6, xs: 4 },
        rowHeight: 80,
        compactType: 'vertical',
        preventCollision: false,
      },
      isShared: true,
      ownerId: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add some tiles to analytics layout with different positions
    const analyticsLayoutTiles = [
      { tileIndex: 0, lg: { x: 0, y: 0, w: 12, h: 4 }, md: { x: 0, y: 0, w: 10, h: 4 }, sm: { x: 0, y: 0, w: 6, h: 4 }, xs: { x: 0, y: 0, w: 4, h: 4 } },
      { tileIndex: 4, lg: { x: 0, y: 4, w: 6, h: 3 }, md: { x: 0, y: 4, w: 5, h: 3 }, sm: { x: 0, y: 4, w: 6, h: 3 }, xs: { x: 0, y: 4, w: 4, h: 3 } },
      { tileIndex: 5, lg: { x: 6, y: 4, w: 6, h: 3 }, md: { x: 5, y: 4, w: 5, h: 3 }, sm: { x: 0, y: 7, w: 6, h: 3 }, xs: { x: 0, y: 7, w: 4, h: 3 } },
    ];

    const analyticsLayoutTilesData = [];
    for (const pos of analyticsLayoutTiles) {
      const tile = insertedTiles[pos.tileIndex];
      for (const breakpoint of ['lg', 'md', 'sm', 'xs'] as const) {
        analyticsLayoutTilesData.push({
          layoutId: analyticsLayoutId,
          tileId: tile.id,
          breakpoint,
          position: pos[breakpoint],
          isVisible: true,
          inheritanceMode: 'inherit' as const,
        });
      }
    }

    await db.insert(layoutTiles).values(analyticsLayoutTilesData);

    console.log('✅ Database seeded successfully!');
    console.log(`   - Created 2 layouts`);
    console.log(`   - Created ${insertedTiles.length} tiles`);
    console.log(`   - Created layout-tile relationships`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };