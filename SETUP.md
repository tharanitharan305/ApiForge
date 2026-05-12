# ApiForge Setup Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL database

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

Create a PostgreSQL database and update the connection string:

```bash
# Copy environment file
cp apps/api-server/.env.example apps/api-server/.env

# Edit apps/api-server/.env and set your DATABASE_URL
# DATABASE_URL="postgresql://user:password@localhost:5432/apiforge"
```

### 3. Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 4. Setup Frontend Environment

```bash
# Copy environment file
cp apps/dashboard-web/.env.local.example apps/dashboard-web/.env.local

# The default API URL is http://localhost:4000/api
# Edit if your backend runs on a different port
```

### 5. Build Packages

```bash
pnpm build
```

### 6. Start Development

```bash
# Start all apps in development mode
pnpm dev
```

This will start:
- **API Server**: http://localhost:4000
- **Dashboard**: http://localhost:3000

## Project Structure

```
/apps
  /dashboard-web    - Next.js frontend (port 3000)
  /api-server       - NestJS backend (port 4000)
/packages
  /core             - Core types and interfaces
  /schema           - Zod validation schemas
  /generator-core   - Base generator engine
  /generator-dart   - Dart code generator
  /generator-ts     - TypeScript generator
  /generator-js     - JavaScript generator
  /generator-python - Python generator
  /shared-utils     - Shared utilities
/templates          - Handlebars templates
```

## Usage

### 1. Create a Project

- Open http://localhost:3000
- Click "New Project"
- Enter project name and description

### 2. Add API Endpoints

- Click on your project
- Click "Add API"
- Fill in the API details:
  - Name, method, endpoint
  - Local and production URLs
  - Response mapping paths

### 3. Export SDK

- Click "Export SDK"
- Select target languages
- Download the generated ZIP file

### 4. Import Config

- Click "Import Config"
- Upload a previously exported config.json
- APIs will be imported into the project

## Database Management

```bash
# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database (WARNING: deletes all data)
cd apps/api-server
pnpm prisma migrate reset
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are in use:

```bash
# Change API server port in apps/api-server/.env
PORT=4001

# Update frontend API URL in apps/dashboard-web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify DATABASE_URL in apps/api-server/.env
- Check database credentials and permissions

### Build Errors

```bash
# Clean all build artifacts
pnpm clean

# Rebuild everything
pnpm build
```

## Development Tips

### Hot Reload

Both frontend and backend support hot reload in development mode.

### API Documentation

API endpoints:
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:projectId/apis` - List APIs
- `POST /api/projects/:projectId/apis` - Create API
- `POST /api/projects/:projectId/export/generate` - Generate SDK ZIP
- `POST /api/projects/:projectId/export/config` - Export config JSON
- `POST /api/projects/:projectId/export/import` - Import config

### Adding New Generators

1. Create new package in `/packages/generator-{language}`
2. Extend `BaseGenerator` class
3. Create templates in `/templates/{language}`
4. Register in `apps/api-server/src/generator/generator.service.ts`

## Production Deployment

### Backend

```bash
cd apps/api-server
pnpm build
pnpm start:prod
```

### Frontend

```bash
cd apps/dashboard-web
pnpm build
pnpm start
```

### Environment Variables

Set these in production:
- `DATABASE_URL` - Production database
- `NODE_ENV=production`
- `FRONTEND_URL` - Production frontend URL
- `NEXT_PUBLIC_API_URL` - Production API URL

## Next Steps

Version 1 is complete with:
- ✅ Project management
- ✅ API endpoint CRUD
- ✅ Multi-language SDK generation
- ✅ Export/Import functionality
- ✅ Response normalization

Future versions will add:
- Authentication
- Firebase sync
- Real-time updates
- Package publishing
- OpenAPI import
- AI-assisted generation
