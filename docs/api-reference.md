# API Reference

SonicJS AI provides a comprehensive REST API for managing content, media, and other resources programmatically.

## Base URL

```
https://your-domain.com/api
```

For local development:
```
http://localhost:8787/api
```

## Authentication

Most API endpoints require authentication. SonicJS AI uses JWT (JSON Web Tokens) for authentication.

### Getting an Access Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Content Management

### List Content Items

```http
GET /api/content
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by content type

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "title": "My First Post",
      "slug": "my-first-post",
      "type": "post",
      "status": "published",
      "content": "Lorem ipsum dolor sit amet...",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Content Item by ID

```http
GET /api/content/{id}
```

### Create Content Item

```http
POST /api/content
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "type": "post",
  "content": "This is the content of my new blog post...",
  "status": "draft"
}
```

### Update Content Item

```http
PUT /api/content/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

### Delete Content Item

```http
DELETE /api/content/{id}
Authorization: Bearer {token}
```

## Media Management

### Upload File

```http
POST /api/media/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [binary data]
```

**Response:**
```json
{
  "id": "abc123",
  "filename": "image.jpg",
  "originalName": "my-image.jpg",
  "mimeType": "image/jpeg",
  "size": 102400,
  "url": "https://your-domain.com/media/abc123/image.jpg",
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

### List Media Files

```http
GET /api/media
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by MIME type (image, video, document)

### Get Media File Details

```http
GET /api/media/{id}
```

### Delete Media File

```http
DELETE /api/media/{id}
Authorization: Bearer {token}
```

## Error Handling

The API uses standard HTTP status codes to indicate success or failure:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "value": null
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## OpenAPI Specification

For a complete, interactive API reference, visit:
- [Scalar UI](/docs) - Modern API documentation
- [Swagger UI](/docs/swagger) - Traditional Swagger interface
- [OpenAPI JSON](/docs/openapi.json) - Raw OpenAPI specification

## SDKs and Libraries

Official SDKs are coming soon! In the meantime, you can use any HTTP client library:

### JavaScript/TypeScript
```typescript
const response = await fetch('/api/content', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### cURL
```bash
curl -X GET "https://your-domain.com/api/content" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

## Support

- 📖 [View full documentation](/docs)
- 💬 [Community discussions](https://github.com/lane711/sonicjs-ai/discussions)
- 🐛 [Report API issues](https://github.com/lane711/sonicjs-ai/issues) 