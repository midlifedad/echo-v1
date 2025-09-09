# Tiles API

## Overview
RESTful API endpoints for managing tiles. All endpoints return JSON and expect JSON payloads for POST/PUT requests.

## Base URL
```
/api/tiles
```

## Endpoints

### List Tiles
Retrieve all tiles with optional filtering.

**Endpoint:** `GET /api/tiles`

**Query Parameters:**
- `type` (string): Filter by tile type
- `category` (string): Filter by category
- `owner` (string): Filter by owner ID
- `isTemplate` (boolean): Filter templates
- `isPublic` (boolean): Filter public tiles
- `tags` (string[]): Filter by tags
- `limit` (number): Maximum results
- `offset` (number): Pagination offset

**Response:**
```json
{
  "tiles": [
    {
      "id": "tile-001",
      "type": "line",
      "title": "Revenue Chart",
      "category": "finance",
      "config": {...},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

### Get Tile
Retrieve a specific tile by ID.

**Endpoint:** `GET /api/tiles/:id`

**Response:**
```json
{
  "id": "tile-001",
  "type": "text",
  "title": "Dashboard Instructions",
  "description": "How to use the dashboard",
  "category": "documentation",
  "tags": ["help", "guide"],
  "isTemplate": false,
  "isPublic": true,
  "config": {
    "type": "text",
    "title": "Dashboard Instructions"
  },
  "content": {
    "richText": "<h1>Welcome</h1><p>...</p>",
    "format": "html"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### Create Tile
Create a new tile.

**Endpoint:** `POST /api/tiles`

**Request Body:**
```json
{
  "type": "image",
  "title": "Company Logo",
  "description": "Main company logo",
  "category": "branding",
  "tags": ["logo", "brand"],
  "config": {
    "type": "image",
    "title": "Company Logo"
  },
  "content": {
    "imageUrl": "https://example.com/logo.png",
    "caption": "Established 2024",
    "alt": "Company Logo"
  }
}
```

**Response:**
```json
{
  "id": "tile-new-001",
  "type": "image",
  "title": "Company Logo",
  ...
  "createdAt": "2024-01-03T00:00:00Z"
}
```

### Update Tile
Update an existing tile.

**Endpoint:** `PUT /api/tiles/:id`

**Request Body:** (Partial updates supported)
```json
{
  "title": "Updated Title",
  "content": {
    "richText": "<p>Updated content</p>",
    "format": "html"
  }
}
```

**Response:**
```json
{
  "id": "tile-001",
  "title": "Updated Title",
  ...
  "updatedAt": "2024-01-04T00:00:00Z"
}
```

### Delete Tile
Delete a tile.

**Endpoint:** `DELETE /api/tiles/:id`

**Response:**
```json
{
  "success": true,
  "message": "Tile deleted successfully"
}
```

### Duplicate Tile
Create a copy of an existing tile.

**Endpoint:** `POST /api/tiles/:id/duplicate`

**Request Body:** (Optional)
```json
{
  "title": "Custom Copy Title",
  "asTemplate": false
}
```

**Response:**
```json
{
  "id": "tile-copy-001",
  "title": "Revenue Chart (Copy)",
  ...
}
```

### Favorite Tile
Mark a tile as favorite for the current user.

**Endpoint:** `POST /api/tiles/:id/favorite`

**Response:**
```json
{
  "success": true,
  "isFavorite": true
}
```

### Unfavorite Tile
Remove a tile from favorites.

**Endpoint:** `DELETE /api/tiles/:id/favorite`

**Response:**
```json
{
  "success": true,
  "isFavorite": false
}
```

### Get Tile Categories
Retrieve all available tile categories.

**Endpoint:** `GET /api/tiles/categories`

**Response:**
```json
{
  "categories": [
    {
      "id": "finance",
      "label": "Finance",
      "count": 12
    },
    {
      "id": "marketing",
      "label": "Marketing",
      "count": 8
    }
  ]
}
```

### Refresh Tile Data
Trigger a data refresh for dynamic tiles.

**Endpoint:** `POST /api/tiles/:id/refresh`

**Response:**
```json
{
  "success": true,
  "data": {...},
  "refreshedAt": "2024-01-05T00:00:00Z"
}
```

### Export Tile
Export a tile configuration.

**Endpoint:** `GET /api/tiles/:id/export`

**Response:**
```json
{
  "version": "1.0",
  "tile": {
    "type": "line",
    "title": "Revenue Chart",
    "config": {...},
    "data": {...}
  },
  "exportedAt": "2024-01-06T00:00:00Z"
}
```

### Import Tile
Import a tile from exported configuration.

**Endpoint:** `POST /api/tiles/import`

**Request Body:**
```json
{
  "version": "1.0",
  "tile": {
    "type": "line",
    "title": "Imported Chart",
    "config": {...}
  }
}
```

**Response:**
```json
{
  "id": "tile-imported-001",
  "title": "Imported Chart",
  ...
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Invalid tile configuration",
  "details": {
    "field": "config.type",
    "issue": "Required field missing"
  }
}
```

### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "Tile not found",
  "id": "tile-nonexistent"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to modify this tile"
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalError",
  "message": "An unexpected error occurred",
  "requestId": "req-123456"
}
```

## Rate Limiting

- **Rate Limit:** 100 requests per minute
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Authentication

Endpoints require authentication via:
- Bearer token in Authorization header
- Session cookie
- API key in X-API-Key header

## Pagination

List endpoints support pagination:
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Skip N results
- `cursor`: Cursor-based pagination token

## Filtering

Complex filtering via query parameters:
```
GET /api/tiles?type=chart&category=finance&tags=revenue,quarterly
```

## Sorting

Sort results via `sort` parameter:
```
GET /api/tiles?sort=createdAt:desc
GET /api/tiles?sort=title:asc,usageCount:desc
```

## Field Selection

Select specific fields via `fields` parameter:
```
GET /api/tiles?fields=id,title,type,config
```

## Batch Operations

### Batch Create
```
POST /api/tiles/batch
{
  "tiles": [...]
}
```

### Batch Update
```
PUT /api/tiles/batch
{
  "updates": [
    { "id": "tile-001", "changes": {...} }
  ]
}
```

### Batch Delete
```
DELETE /api/tiles/batch
{
  "ids": ["tile-001", "tile-002"]
}