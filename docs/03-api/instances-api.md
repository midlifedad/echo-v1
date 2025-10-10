# Instances API

## Overview
RESTful API endpoints for managing tile instances within layouts. Instances are actual tiles positioned in layouts, either linked to templates or custom standalone tiles.

## Base URL
```
/api/instances
```

## Endpoints

### List Instances
Retrieve instances with optional filtering.

**Endpoint:** `GET /api/instances`

**Query Parameters:**
- `layoutId` (string): Filter by layout ID
- `templateId` (string): Filter by template ID
- `type` (string): Filter by tile type
- `isModified` (boolean): Filter modified instances
- `limit` (number): Maximum results
- `offset` (number): Pagination offset

**Response:**
```json
{
  "instances": [
    {
      "id": "instance-001",
      "templateId": "template-001",
      "layoutId": "layout-001",
      "type": "line",
      "title": "Q1 Revenue",
      "isModified": true,
      "displaySettings": {...},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### Get Instance
Retrieve a specific instance by ID.

**Endpoint:** `GET /api/instances/:id`

**Response:**
```json
{
  "id": "instance-001",
  "templateId": "template-001",
  "layoutId": "layout-001",
  "parentInstanceId": null,
  "type": "text",
  "title": "Custom Instructions",
  "config": {
    "type": "text",
    "title": "Custom Instructions"
  },
  "content": {
    "richText": "<h1>Custom Content</h1><p>...</p>",
    "format": "html"
  },
  "displaySettings": {
    "showBorder": true,
    "borderColor": "#3b82f6",
    "expandable": true,
    "showTitle": true,
    "titlePosition": "top",
    "locked": false
  },
  "isModified": true,
  "lastSyncedAt": "2024-01-01T12:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

### Create Instance
Create a new instance within a layout.

**Endpoint:** `POST /api/instances`

**Request Body:**
```json
{
  "templateId": "template-001",
  "layoutId": "layout-001",
  "title": "My Custom Title",
  "displaySettings": {
    "showBorder": false,
    "backgroundColor": "#f8fafc",
    "showTitle": true
  },
  "config": {
    // Override template config if needed
  },
  "content": {
    // Override template content if needed
  }
}
```

**Response:**
```json
{
  "id": "instance-new-001",
  "templateId": "template-001",
  "layoutId": "layout-001",
  "isModified": false,
  ...
  "createdAt": "2024-01-03T00:00:00Z"
}
```

### Create Custom Instance
Create an instance without a template (standalone).

**Endpoint:** `POST /api/instances`

**Request Body:**
```json
{
  "layoutId": "layout-001",
  "type": "image",
  "title": "Custom Image",
  "config": {
    "type": "image",
    "title": "Custom Image"
  },
  "content": {
    "imageUrl": "https://example.com/custom.png",
    "alt": "Custom image"
  },
  "displaySettings": {
    "showBorder": true,
    "showTitle": false
  }
}
```

**Response:**
```json
{
  "id": "instance-custom-001",
  "templateId": null,
  "layoutId": "layout-001",
  "isModified": true,
  ...
}
```

### Update Instance
Update an existing instance.

**Endpoint:** `PUT /api/instances/:id`

**Request Body:** (Partial updates supported)
```json
{
  "title": "Updated Instance Title",
  "displaySettings": {
    "showBorder": false,
    "backgroundColor": "#fef3c7"
  },
  "content": {
    "richText": "<p>Updated content</p>"
  }
}
```

**Response:**
```json
{
  "id": "instance-001",
  "title": "Updated Instance Title",
  "isModified": true,
  ...
  "updatedAt": "2024-01-04T00:00:00Z"
}
```

### Delete Instance
Delete an instance from a layout.

**Endpoint:** `DELETE /api/instances/:id`

**Response:**
```json
{
  "success": true,
  "message": "Instance deleted successfully"
}
```

### Duplicate Instance
Create a copy of an instance within the same or different layout.

**Endpoint:** `POST /api/instances/:id/duplicate`

**Request Body:**
```json
{
  "layoutId": "layout-002",
  "title": "Copied Instance"
}
```

**Response:**
```json
{
  "id": "instance-copy-001",
  "parentInstanceId": "instance-001",
  "layoutId": "layout-002",
  ...
}
```

### Sync with Template
Sync an instance with its template (revert customizations).

**Endpoint:** `POST /api/instances/:id/sync`

**Response:**
```json
{
  "success": true,
  "isModified": false,
  "lastSyncedAt": "2024-01-05T00:00:00Z"
}
```

### Save Instance as Template
Convert a modified instance into a new template.

**Endpoint:** `POST /api/instances/:id/save-as-template`

**Request Body:**
```json
{
  "name": "My Custom Template",
  "description": "Template created from instance",
  "category": "custom",
  "isPublic": false
}
```

**Response:**
```json
{
  "templateId": "template-new-001",
  "name": "My Custom Template",
  "usageCount": 1,
  ...
}
```

### Get Instance with Template
Retrieve instance with its template data.

**Endpoint:** `GET /api/instances/:id?include=template`

**Response:**
```json
{
  "instance": {
    "id": "instance-001",
    "templateId": "template-001",
    "layoutId": "layout-001",
    ...
  },
  "template": {
    "id": "template-001",
    "title": "Base Template",
    "config": {...},
    "defaultDisplaySettings": {...}
  }
}
```

### Bulk Update Instances
Update multiple instances in a single request.

**Endpoint:** `PUT /api/instances/bulk`

**Request Body:**
```json
{
  "updates": [
    {
      "id": "instance-001",
      "changes": {
        "displaySettings": {
          "showBorder": false
        }
      }
    },
    {
      "id": "instance-002", 
      "changes": {
        "title": "Updated Title"
      }
    }
  ]
}
```

**Response:**
```json
{
  "updated": [
    {
      "id": "instance-001",
      "success": true
    },
    {
      "id": "instance-002",
      "success": true
    }
  ]
}
```

### Get Layout Instances
Get all instances for a specific layout.

**Endpoint:** `GET /api/layouts/:layoutId/instances`

**Response:**
```json
{
  "layoutId": "layout-001",
  "instances": [
    {
      "id": "instance-001",
      "templateId": "template-001",
      "type": "line",
      "title": "Revenue Chart",
      "displaySettings": {...},
      "positions": {
        "lg": { "x": 0, "y": 0, "w": 6, "h": 4 },
        "md": { "x": 0, "y": 0, "w": 5, "h": 4 }
      }
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Invalid instance configuration",
  "details": {
    "field": "layoutId",
    "issue": "Layout ID is required"
  }
}
```

### 404 Not Found
```json
{
  "error": "NotFound",
  "message": "Instance not found",
  "id": "instance-nonexistent"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Cannot delete instance: still positioned in layout"
}
```

## Special Behaviors

### Template Linking
- Instances can be linked to templates via `templateId`
- When linked, instances inherit template properties but can override them
- Changes to instances mark them as `isModified: true`

### Display Settings Inheritance
- Instances inherit `defaultDisplaySettings` from templates
- Instance `displaySettings` override template defaults
- Settings are merged (instance settings take precedence)

### Synchronization
- `POST /sync` endpoint reverts instance to template state
- Only affects instances with `templateId` 
- Removes customizations and sets `isModified: false`

### Custom Instances
- Instances without `templateId` are standalone/custom
- Always have `isModified: true`
- Cannot be synced with templates

## Authentication

All endpoints require authentication. Use:
- Bearer token in Authorization header
- Session cookie
- API key in X-API-Key header

## Rate Limiting

- Standard rate limits apply (100 requests/minute)
- Bulk operations count as single requests
- Sync operations have separate limits (10/minute)