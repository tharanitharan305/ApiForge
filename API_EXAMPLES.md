# ApiForge API Examples

Complete examples of API requests and responses for testing and development.

## Base URLs

- **Development**: http://localhost:4000/api
- **Production**: https://your-domain.com/api

## Authentication

> Note: v1.0 does not include authentication. All endpoints are currently open.
> Future versions will add JWT-based authentication.

## Projects API

### List All Projects

```http
GET /api/projects
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My API Project",
    "description": "User authentication API",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "apis": [],
    "_count": {
      "apis": 5,
      "exports": 2
    }
  }
]
```

### Create Project

```http
POST /api/projects
Content-Type: application/json

{
  "name": "My API Project",
  "description": "User authentication API"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My API Project",
  "description": "User authentication API",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "apis": []
}
```

### Get Project

```http
GET /api/projects/{projectId}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My API Project",
  "description": "User authentication API",
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "apis": [
    {
      "id": "uuid",
      "name": "Login",
      "method": "POST",
      "endpoint": "/auth/login"
    }
  ]
}
```

### Update Project

```http
PATCH /api/projects/{projectId}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### Delete Project

```http
DELETE /api/projects/{projectId}
```

**Response:** 204 No Content

## APIs Endpoint

### List APIs

```http
GET /api/projects/{projectId}/apis
```

**Response:**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "name": "Login",
    "description": "User login endpoint",
    "localUrl": "http://localhost:3000",
    "productionUrl": "https://api.example.com",
    "endpoint": "/auth/login",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "X-API-Key": "your-api-key"
    },
    "queryParams": [],
    "requestBody": [
      {
        "key": "email",
        "type": "string",
        "required": true,
        "description": "User email"
      },
      {
        "key": "password",
        "type": "string",
        "required": true,
        "description": "User password"
      }
    ],
    "responseMapping": {
      "successPath": "success",
      "messagePath": "message",
      "dataPath": "data",
      "statusCodePath": "statusCode"
    },
    "timeout": 30000,
    "authRequired": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create API

```http
POST /api/projects/{projectId}/apis
Content-Type: application/json

{
  "name": "Login",
  "description": "User login endpoint",
  "environments": {
    "local": "http://localhost:3000",
    "production": "https://api.example.com"
  },
  "endpoint": "/auth/login",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "your-api-key"
  },
  "queryParams": [],
  "requestBody": [
    {
      "key": "email",
      "type": "string",
      "required": true,
      "description": "User email"
    },
    {
      "key": "password",
      "type": "string",
      "required": true,
      "description": "User password"
    }
  ],
  "responseMapping": {
    "successPath": "success",
    "messagePath": "message",
    "dataPath": "data",
    "statusCodePath": "statusCode"
  },
  "timeout": 30000,
  "authRequired": false
}
```

### Complex API Example (with nested body)

```http
POST /api/projects/{projectId}/apis
Content-Type: application/json

{
  "name": "CreateUser",
  "description": "Create new user with profile",
  "environments": {
    "local": "http://localhost:3000",
    "production": "https://api.example.com"
  },
  "endpoint": "/users",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  },
  "queryParams": [
    {
      "key": "sendEmail",
      "value": "true",
      "required": false,
      "description": "Send welcome email"
    }
  ],
  "requestBody": [
    {
      "key": "email",
      "type": "string",
      "required": true,
      "description": "User email"
    },
    {
      "key": "profile",
      "type": "object",
      "required": true,
      "description": "User profile",
      "children": [
        {
          "key": "firstName",
          "type": "string",
          "required": true
        },
        {
          "key": "lastName",
          "type": "string",
          "required": true
        },
        {
          "key": "age",
          "type": "number",
          "required": false
        }
      ]
    },
    {
      "key": "roles",
      "type": "array",
      "required": false,
      "description": "User roles"
    }
  ],
  "responseMapping": {
    "successPath": "success",
    "messagePath": "message",
    "dataPath": "data.user",
    "statusCodePath": "statusCode"
  },
  "timeout": 30000,
  "authRequired": true
}
```

### Update API

```http
PATCH /api/projects/{projectId}/apis/{apiId}
Content-Type: application/json

{
  "name": "Updated Login",
  "timeout": 60000
}
```

### Delete API

```http
DELETE /api/projects/{projectId}/apis/{apiId}
```

**Response:** 204 No Content

## Export API

### Generate SDK ZIP

```http
POST /api/projects/{projectId}/export/generate
Content-Type: application/json

{
  "languages": ["typescript", "dart", "python"]
}
```

**Response:** Binary ZIP file

**Headers:**
```
Content-Type: application/zip
Content-Disposition: attachment; filename="apiforge-sdk.zip"
```

### Export Config JSON

```http
POST /api/projects/{projectId}/export/config
```

**Response:**
```json
{
  "project": {
    "id": "uuid",
    "name": "My API Project",
    "description": "User authentication API"
  },
  "apis": [
    {
      "id": "uuid",
      "name": "Login",
      "description": "User login endpoint",
      "environments": {
        "local": "http://localhost:3000",
        "production": "https://api.example.com"
      },
      "endpoint": "/auth/login",
      "method": "POST",
      "headers": {},
      "queryParams": [],
      "requestBody": [],
      "responseMapping": {
        "successPath": "success",
        "messagePath": "message",
        "dataPath": "data"
      },
      "timeout": 30000,
      "authRequired": false
    }
  ],
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Import Config

```http
POST /api/projects/{projectId}/export/import
Content-Type: application/json

{
  "config": {
    "project": {
      "name": "Imported Project",
      "description": "Imported from config"
    },
    "apis": [
      {
        "name": "Login",
        "environments": {
          "local": "http://localhost:3000",
          "production": "https://api.example.com"
        },
        "endpoint": "/auth/login",
        "method": "POST",
        "headers": {},
        "queryParams": [],
        "requestBody": [],
        "responseMapping": {
          "successPath": "success",
          "messagePath": "message",
          "dataPath": "data"
        },
        "timeout": 30000,
        "authRequired": false
      }
    ],
    "exportedAt": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

**Response:**
```json
{
  "message": "Config imported successfully",
  "imported": 1
}
```

## Error Responses

### Validation Error

```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "endpoint must be a URL"
  ],
  "error": "Bad Request"
}
```

### Not Found

```json
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "Not Found"
}
```

### Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Testing with cURL

### Create Project
```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Testing API"
  }'
```

### Create API
```bash
curl -X POST http://localhost:4000/api/projects/{projectId}/apis \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login",
    "environments": {
      "local": "http://localhost:3000",
      "production": "https://api.example.com"
    },
    "endpoint": "/auth/login",
    "method": "POST",
    "responseMapping": {
      "successPath": "success",
      "messagePath": "message",
      "dataPath": "data"
    }
  }'
```

### Export SDK
```bash
curl -X POST http://localhost:4000/api/projects/{projectId}/export/generate \
  -H "Content-Type: application/json" \
  -d '{"languages": ["typescript", "dart"]}' \
  -o sdk.zip
```

## Testing with HTTPie

### Create Project
```bash
http POST http://localhost:4000/api/projects \
  name="Test Project" \
  description="Testing API"
```

### List Projects
```bash
http GET http://localhost:4000/api/projects
```

### Export Config
```bash
http POST http://localhost:4000/api/projects/{projectId}/export/config
```

## Postman Collection

Import this collection into Postman:

```json
{
  "info": {
    "name": "ApiForge API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Projects",
      "item": [
        {
          "name": "List Projects",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/projects"
          }
        },
        {
          "name": "Create Project",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/projects",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"My Project\",\n  \"description\": \"Test\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000/api"
    }
  ]
}
```

## Response Mapping Examples

### Standard REST API
```json
{
  "responseMapping": {
    "successPath": "success",
    "messagePath": "message",
    "dataPath": "data",
    "statusCodePath": "statusCode"
  }
}
```

**API Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "userId": "123", "token": "..." },
  "statusCode": 200
}
```

### Nested Response
```json
{
  "responseMapping": {
    "successPath": "meta.success",
    "messagePath": "meta.message",
    "dataPath": "payload.user",
    "statusCodePath": "meta.code"
  }
}
```

**API Response:**
```json
{
  "meta": {
    "success": true,
    "message": "User created",
    "code": 201
  },
  "payload": {
    "user": { "id": "123", "email": "user@example.com" }
  }
}
```

### Simple Response
```json
{
  "responseMapping": {
    "successPath": "ok",
    "messagePath": "msg",
    "dataPath": "result"
  }
}
```

**API Response:**
```json
{
  "ok": true,
  "msg": "Success",
  "result": { "id": "123" }
}
```

---

**Need more examples?** Check the [SETUP.md](SETUP.md) for additional documentation.
