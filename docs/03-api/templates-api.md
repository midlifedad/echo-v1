# Templates API

## Overview
RESTful API endpoints for managing tile templates in the library. Templates are reusable tile definitions that can be instantiated in layouts.

## Base URL
```
/api/templates
```

## Endpoints

### List Templates
Retrieve templates from the library with optional filtering.

**Endpoint:** `GET /api/templates`

**Query Parameters:**
- `type` (string): Filter by tile type
- `category` (string): Filter by category
- `owner` (string): Filter by owner ID
- `isSystem` (boolean): Filter system templates
- `isPublic` (boolean): Filter public templates
- `tags` (string[]): Filter by tags
- `limit` (number): Maximum results
- `offset` (number): Pagination offset

**Response:**
```json
{
  "templates": [
    {
      "id": "template-001",
      "type": "line",
      "title": "Revenue Chart",
      "name": "Monthly Revenue Template",
      "category": "finance",
      "isSystem": false,
      "isPublic": true,
      "usageCount": 15,
      "config": {...},
      "defaultDisplaySettings": {...},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

### Get Template
Retrieve a specific template by ID.

**Endpoint:** `GET /api/templates/:id`

**Response:**
```json
{
  "id": "template-001",
  "type": "text",
  "title": "Dashboard Instructions",
  "name": "Instruction Template",
  "description": "How to use the dashboard",
  "category": "documentation",
  "tags": ["help", "guide"],
  "isSystem": false,
  "isPublic": true,
  "usageCount": 25,
  "config": {
    "type": "text",
    "title": "Dashboard Instructions"
  },
  "content": {
    "richText": "<h1>Welcome</h1><p>...</p>",
    "format": "html"
  },
  "defaultDisplaySettings": {
    "showBorder": true,
    "expandable": true,
    "showTitle": true,
    "titlePosition": "top"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### Create Template
Create a new template in the library.

**Endpoint:** `POST /api/templates`

**Request Body:**
```json
{
  "type": "image",
  "title": "Company Logo",
  "name": "Corporate Logo Template",
  "description": "Standard company logo template",
  "category": "branding",
  "tags": ["logo", "brand"],
  "isPublic": true,
  "config": {
    "type": "image",
    "title": "Company Logo"
  },
  "content": {
    "imageUrl": "https://example.com/logo.png",
    "caption": "Established 2024",
    "alt": "Company Logo"
  },
  "defaultDisplaySettings": {
    "showBorder": false,
    "expandable": false,
    "showTitle": false
  }
}
```

**Response:**
```json
{
  "id": "template-new-001",
  "type": "image",
  "title": "Company Logo",
  "usageCount": 0,
  ...
  "createdAt": "2024-01-03T00:00:00Z"
}
```

### Update Template
Update an existing template.

**Endpoint:** `PUT /api/templates/:id`

**Request Body:** (Partial updates supported)
```json
{
  "title": "Updated Template Title",
  "description": "Updated description",
  "defaultDisplaySettings": {
    "showBorder": true,
    "expandable": true
  }
}
```

**Response:**
```json
{
  "id": "template-001",
  "title": "Updated Template Title",
  ...
  "updatedAt": "2024-01-04T00:00:00Z"
}
```

### Delete Template
Delete a template from the library.

**Endpoint:** `DELETE /api/templates/:id`

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Duplicate Template
Create a copy of an existing template.

**Endpoint:** `POST /api/templates/:id/duplicate`

**Request Body:** (Optional)
```json
{
  "name": "Custom Copy Name",
  "title": "Copied Template Title"
}
```

**Response:**
```json
{
  "id": "template-copy-001",
  "title": "Revenue Chart (Copy)",
  ...
}
```

### Favorite Template
Mark a template as favorite for the current user.

**Endpoint:** `POST /api/templates/:id/favorite`

**Response:**
```json
{
  "success": true,
  "isFavorite": true
}
```

### Unfavorite Template
Remove a template from favorites.

**Endpoint:** `DELETE /api/templates/:id/favorite`

**Response:**
```json
{
  "success": true,
  "isFavorite": false
}
```

### Get Template Categories
Retrieve all available template categories.

**Endpoint:** `GET /api/templates/categories`

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

### Export Template
Export a template configuration.

**Endpoint:** `GET /api/templates/:id/export`

**Response:**
```json
{
  "version": "1.0",
  "template": {
    "type": "line",
    "title": "Revenue Chart",
    "config": {...},
    "data": {...}
  },
  "exportedAt": "2024-01-06T00:00:00Z"
}
```

### Import Template
Import a template from exported configuration.

**Endpoint:** `POST /api/templates/import`

**Request Body:**
```json
{
  "version": "1.0",
  "template": {
    "type": "line",
    "title": "Imported Chart",
    "config": {...}
  }
}
```

**Response:**
```json
{
  "id": "template-imported-001",
  "title": "Imported Chart",
  ...
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Invalid template configuration",
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
  "message": "Template not found",
  "id": "template-nonexistent"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to modify this template"
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
GET /api/templates?type=chart&category=finance&tags=revenue,quarterly
```

## Sorting

Sort results via `sort` parameter:
```
GET /api/templates?sort=createdAt:desc
GET /api/templates?sort=usageCount:desc,title:asc
```

## Field Selection

Select specific fields via `fields` parameter:
```
GET /api/templates?fields=id,title,type,config
```