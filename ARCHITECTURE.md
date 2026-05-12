# ApiForge Architecture

## Overview

ApiForge is built as a scalable monorepo using TurboRepo, designed with clean architecture principles and plugin-based extensibility.

## Core Principles

1. **Plugin-Based Generators**: Each language generator is an independent plugin
2. **Clean Architecture**: Separation of concerns across layers
3. **Type Safety**: Strongly typed throughout with TypeScript and Zod
4. **Scalability**: Designed to support future enterprise features
5. **Maintainability**: Reusable abstractions and DRY principles

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Projects   │  │     APIs     │  │    Export    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   API Server (NestJS)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Project    │  │     API      │  │   Generator  │  │
│  │   Module     │  │   Module     │  │    Module    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Export     │  │    Prisma    │                    │
│  │   Module     │  │   Service    │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Generator Engine                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Dart      │  │  TypeScript  │  │  JavaScript  │  │
│  │  Generator   │  │  Generator   │  │  Generator   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Python     │  │   Template   │                    │
│  │  Generator   │  │    Engine    │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
│         Users │ Projects │ APIs │ Exports               │
└─────────────────────────────────────────────────────────┘
```

## Package Structure

### Apps

#### dashboard-web (Next.js)
- **Purpose**: User interface for managing projects and APIs
- **Tech**: Next.js 14, React, TailwindCSS, shadcn/ui
- **Features**:
  - Project CRUD
  - API endpoint management
  - Export/Import functionality
  - Modern dark mode UI

#### api-server (NestJS)
- **Purpose**: Backend API and business logic
- **Tech**: NestJS, Prisma, PostgreSQL
- **Modules**:
  - **ProjectModule**: Project management
  - **ApiModule**: API endpoint CRUD
  - **GeneratorModule**: Code generation orchestration
  - **ExportModule**: ZIP export and config import/export
  - **PrismaModule**: Database access

### Packages

#### @apiforge/core
- **Purpose**: Core types and interfaces
- **Exports**:
  - `ApiDefinition` - API configuration type
  - `GeneratorPlugin` - Generator interface
  - `NormalizedResponse` - Unified response type
  - `ExportConfig` - Export configuration type

#### @apiforge/schema
- **Purpose**: Zod validation schemas
- **Exports**:
  - `ApiDefinitionSchema` - API validation
  - `ProjectSchema` - Project validation
  - `ExportConfigSchema` - Export validation

#### @apiforge/generator-core
- **Purpose**: Base generator engine
- **Exports**:
  - `BaseGenerator` - Abstract base class
  - `GeneratorRegistry` - Plugin registry
- **Features**:
  - Template rendering with Handlebars
  - Helper functions registration
  - Common generator logic

#### @apiforge/generator-{language}
- **Purpose**: Language-specific generators
- **Languages**: dart, typescript, javascript, python
- **Pattern**: Each extends `BaseGenerator`
- **Responsibilities**:
  - Load language templates
  - Generate API service files
  - Generate index/export files

#### @apiforge/shared-utils
- **Purpose**: Shared utility functions
- **Exports**:
  - String helpers (camelCase, pascalCase, etc.)
  - ZIP creation utilities
  - Common transformations

## Generator Plugin Architecture

### Interface

```typescript
interface GeneratorPlugin {
  language: string;
  fileExtension: string;
  generateApi(api: ApiDefinition): Promise<GeneratedFile>;
  generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile>;
}
```

### Base Generator

```typescript
abstract class BaseGenerator implements GeneratorPlugin {
  protected handlebars: typeof Handlebars;
  protected renderTemplate(template: string, context: any): string;
  protected registerHelpers(): void;
  protected getFilename(apiName: string): string;
}
```

### Adding New Generators

1. Create package: `packages/generator-{language}`
2. Extend `BaseGenerator`
3. Create templates in `templates/{language}/`
4. Register in `GeneratorService`

## Template System

### Handlebars Templates

Templates use Handlebars with custom helpers:

**Available Helpers:**
- `camelCase` - Convert to camelCase
- `pascalCase` - Convert to PascalCase
- `snakeCase` - Convert to snake_case
- `kebabCase` - Convert to kebab-case
- `capitalize` - Capitalize first letter
- `uppercase` / `lowercase` - Case conversion
- `eq`, `or`, `and` - Logical operators

### Template Structure

```
/templates
  /{language}
    /api.hbs      - Individual API service template
    /index.hbs    - Index/export file template
```

## Response Normalization

All generated SDKs normalize API responses to a consistent structure:

```typescript
interface NormalizedResponse<T = any> {
  success: boolean;      // Extracted from response
  statusCode: number;    // HTTP status code
  message: string;       // User-facing message
  data: T;              // Actual response data
  raw: any;             // Original response
}
```

This allows different APIs with different response formats to be consumed consistently.

## Database Schema

### Users
- id, email, name
- One-to-many with Projects

### Projects
- id, name, description, userId
- One-to-many with APIs
- One-to-many with Exports

### APIs
- id, projectId, name, description
- environments (local/production URLs)
- endpoint, method, headers
- queryParams, requestBody (JSON)
- responseMapping (JSON)
- timeout, authRequired

### Exports
- id, projectId, config (JSON)
- languages[], createdAt

## Data Flow

### Creating an API

```
User Input → Form Validation (Zod) → API Controller → 
API Service → Prisma → Database
```

### Generating SDK

```
Export Request → Export Controller → Export Service →
Generator Service → Language Generators → Template Rendering →
ZIP Creation → Download
```

### Importing Config

```
JSON Upload → Validation (Zod) → Export Service →
Delete Existing APIs → Create New APIs → Database
```

## Security Considerations

### Current (v1)
- Input validation with Zod
- SQL injection prevention via Prisma
- CORS configuration
- Environment variable isolation

### Future
- JWT authentication
- Role-based access control
- API rate limiting
- Audit logging

## Scalability Design

### Horizontal Scaling
- Stateless API server
- Database connection pooling
- Separate generator workers (future)

### Vertical Scaling
- Efficient template caching
- Streaming ZIP generation
- Lazy loading of generators

### Future Enhancements
- Redis caching
- Message queue for generation jobs
- CDN for static assets
- Multi-region deployment

## Extension Points

### Adding Features

1. **New Language Generator**
   - Create generator package
   - Add templates
   - Register in service

2. **New Export Format**
   - Extend ExportService
   - Add format-specific logic
   - Update UI options

3. **Authentication**
   - Add AuthModule
   - Implement JWT strategy
   - Add guards to controllers

4. **Real-time Sync**
   - Add WebSocket gateway
   - Implement event emitters
   - Update frontend with subscriptions

## Testing Strategy

### Unit Tests
- Generator logic
- Template rendering
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Export/Import flow

### E2E Tests
- Full user workflows
- Multi-language generation
- Import/Export round-trip

## Performance Optimization

### Current
- Efficient Prisma queries
- Template compilation caching
- Streaming ZIP generation

### Future
- Generator result caching
- Incremental generation
- Background job processing

## Monitoring & Observability

### Logging
- Structured logging with NestJS
- Request/response logging
- Error tracking

### Metrics (Future)
- Generation time per language
- API endpoint usage
- Export frequency
- Error rates

## Deployment Architecture

### Development
```
Local Machine → pnpm dev → Hot Reload
```

### Production
```
Git Push → CI/CD → Build → Test → Deploy
  ├─ Frontend → Vercel/Netlify
  └─ Backend → AWS/GCP/Azure
```

## Technology Decisions

### Why TurboRepo?
- Efficient monorepo management
- Incremental builds
- Shared caching
- Simple configuration

### Why NestJS?
- Enterprise-grade architecture
- Dependency injection
- Modular structure
- TypeScript native

### Why Prisma?
- Type-safe database access
- Migration management
- Excellent DX
- PostgreSQL support

### Why Handlebars?
- Logic-less templates
- Easy to read/write
- Powerful helpers
- Wide adoption

### Why shadcn/ui?
- Modern component library
- Customizable
- Accessible
- TailwindCSS integration

## Conclusion

ApiForge v1 provides a solid foundation for multi-language SDK generation with a clean, scalable architecture ready for future enterprise features.
