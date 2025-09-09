# Layouts API

## Overview
RESTful API endpoints for managing dashboard layouts and tile positioning.

## Base URL
```
/api/layouts
```

## Endpoints

### List Layouts
Retrieve all layouts for the current user.

**Endpoint:** `GET /api/layouts`

**Query Parameters:**
- `isShared` (boolean): Include shared layouts
- `owner` (string): Filter by owner
- `tags` (string[]): Filter by tags
- `limit` (number): Maximum results
- `offset` (number): Pagination offset

**Response:**
```json
{
  "layouts": [
    {
      "id": "layout-001",
      "name": "Executive Dashboard",
      "description": "High-level metrics",
      "isDefault": true,
      "isShared": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5
}
```

### Get Layout
Retrieve a specific layout with full configuration.

**Endpoint:** `GET /api/layouts/:id`

**Response:**
```json
{
  "id": "layout-001",
  "name": "Executive Dashboard",
  "description": "High-level business metrics",
  "config": {
    "cols": { "lg": 12, "md": 10, "sm": 6, "xs": 4 },
    "rowHeight": 80,
    "compactType": "vertical"
  },
  "isDefault": true,
  "isShared": false,
  "metadata": {
    "purpose": "executive",
    "version": 1
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### Create Layout
Create a new layout.

**Endpoint:** `POST /api/layouts`

**Request Body:**
```json
{
  "name": "Sales Dashboard",
  "description": "Sales team metrics",
  "config": {
    "cols": { "lg": 12, "md": 10, "sm": 6, "xs": 4 },
    "rowHeight": 80
  },
  "isDefault": false,
  "isShared": true,
  "metadata": {
    "purpose": "sales"
  }
}
```

**Response:**
```json
{
  "id": "layout-new-001",
  "name": "Sales Dashboard",
  ...
}
```

### Update Layout
Update layout configuration.

**Endpoint:** `PUT /api/layouts/:id`

**Request Body:**
```json
{
  "name": "Updated Dashboard Name",
  "isDefault": true
}
```

**Response:**
```json
{
  "id": "layout-001",
  "name": "Updated Dashboard Name",
  ...
  "updatedAt": "2024-01-03T00:00:00Z"
}
```

### Delete Layout
Delete a layout.

**Endpoint:** `DELETE /api/layouts/:id`

**Response:**
```json
{
  "success": true,
  "message": "Layout deleted successfully"
}
```

### Duplicate Layout
Create a copy of an existing layout.

**Endpoint:** `POST /api/layouts/:id/duplicate`

**Request Body:**
```json
{
  "name": "Copy of Executive Dashboard"
}
```

**Response:**
```json
{
  "id": "layout-copy-001",
  "name": "Copy of Executive Dashboard",
  ...
}
```

## Layout Tiles Endpoints

### Get Layout Tiles
Get all tiles and their positions for a layout.

**Endpoint:** `GET /api/layouts/:layoutId/tiles`

**Query Parameters:**
- `breakpoint` (string): Specific breakpoint (lg/md/sm/xs)

**Response:**
```json
{
  "layoutId": "layout-001",
  "tiles": [
    {
      "tileId": "tile-001",
      "tile": {
        "id": "tile-001",
        "type": "line",
        "title": "Revenue Chart"
      },
      "positions": {
        "lg": { "x": 0, "y": 0, "w": 6, "h": 4 },
        "md": { "x": 0, "y": 0, "w": 5, "h": 4 },
        "sm": { "x": 0, "y": 0, "w": 6, "h": 4 },
        "xs": { "x": 0, "y": 0, "w": 4, "h": 4 }
      },
      "isVisible": true,
      "inheritanceMode": "custom"
    }
  ]
}
```

### Add Tile to Layout
Add a tile to a layout with positioning.

**Endpoint:** `POST /api/layouts/:layoutId/tiles`

**Request Body:**
```json
{
  "tileId": "tile-002",
  "positions": {
    "lg": { "x": 6, "y": 0, "w": 6, "h": 4 },
    "md": { "x": 5, "y": 0, "w": 5, "h": 4 },
    "sm": { "x": 0, "y": 4, "w": 6, "h": 4 },
    "xs": { "x": 0, "y": 4, "w": 4, "h": 4 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "layoutId": "layout-001",
  "tileId": "tile-002"
}
```

### Update Tile Position
Update a tile's position in a layout.

**Endpoint:** `PUT /api/layouts/:layoutId/tiles/:tileId`

**Request Body:**
```json
{
  "breakpoint": "lg",
  "position": { "x": 0, "y": 4, "w": 12, "h": 3 },
  "inheritanceMode": "custom"
}
```

**Response:**
```json
{
  "success": true,
  "position": { "x": 0, "y": 4, "w": 12, "h": 3 }
}
```

### Remove Tile from Layout
Remove a tile from a layout.

**Endpoint:** `DELETE /api/layouts/:layoutId/tiles/:tileId`

**Response:**
```json
{
  "success": true,
  "message": "Tile removed from layout"
}
```

### Update All Positions
Bulk update tile positions (used after drag/drop).

**Endpoint:** `PUT /api/layouts/:layoutId/positions`

**Request Body:**
```json
{
  "breakpoint": "lg",
  "positions": [
    {
      "tileId": "tile-001",
      "position": { "x": 0, "y": 0, "w": 6, "h": 4 }
    },
    {
      "tileId": "tile-002",
      "position": { "x": 6, "y": 0, "w": 6, "h": 4 }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "updated": 2
}
```

## Import/Export

### Export Layout
Export layout configuration.

**Endpoint:** `GET /api/layouts/:id/export`

**Response:**
```json
{
  "version": "1.0",
  "layout": {
    "name": "Executive Dashboard",
    "config": {...},
    "tiles": [...],
    "positions": {...}
  },
  "exportedAt": "2024-01-04T00:00:00Z"
}
```

### Import Layout
Import a layout from configuration.

**Endpoint:** `POST /api/layouts/import`

**Request Body:**
```json
{
  "version": "1.0",
  "layout": {
    "name": "Imported Dashboard",
    "config": {...},
    "tiles": [...],
    "positions": {...}
  }
}
```

**Response:**
```json
{
  "id": "layout-imported-001",
  "name": "Imported Dashboard",
  ...
}
```

## Templates

### Get Layout Templates
Get available layout templates.

**Endpoint:** `GET /api/layouts/templates`

**Response:**
```json
{
  "templates": [
    {
      "id": "template-sales",
      "name": "Sales Dashboard Template",
      "description": "Pre-configured sales metrics",
      "thumbnail": "data:image/png;base64,...",
      "category": "sales"
    }
  ]
}
```

### Create from Template
Create a new layout from a template.

**Endpoint:** `POST /api/layouts/from-template`

**Request Body:**
```json
{
  "templateId": "template-sales",
  "name": "My Sales Dashboard"
}
```

**Response:**
```json
{
  "id": "layout-from-template-001",
  "name": "My Sales Dashboard",
  ...
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Invalid layout configuration",
  "details": {
    "field": "config.cols",
    "issue": "Columns must be positive integers"
  }
}
```

### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "Layout not found",
  "id": "layout-nonexistent"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Only one layout can be default"
}
```

## Pagination

Standard pagination parameters:
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Skip N results
- `page`: Page number (alternative to offset)

## WebSocket Events

Real-time layout updates via WebSocket:

### Subscribe to Layout
```json
{
  "action": "subscribe",
  "layoutId": "layout-001"
}
```

### Layout Update Event
```json
{
  "event": "layout.updated",
  "layoutId": "layout-001",
  "changes": {...},
  "timestamp": "2024-01-05T00:00:00Z"
}
```

### Position Update Event
```json
{
  "event": "position.updated",
  "layoutId": "layout-001",
  "tileId": "tile-001",
  "breakpoint": "lg",
  "position": { "x": 0, "y": 0, "w": 6, "h": 4 }
}