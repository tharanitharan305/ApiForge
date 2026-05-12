# ApiForge Quick Start Guide

Get ApiForge running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need >= 18)
node --version

# Check pnpm (install if needed)
pnpm --version

# If pnpm not installed:
npm install -g pnpm

# Check PostgreSQL
psql --version
```

## Step 1: Clone & Install (2 min)

```bash
# Navigate to project directory
cd apiforge

# Install all dependencies
pnpm install
```

## Step 2: Database Setup (1 min)

```bash
# Create PostgreSQL database
createdb apiforge

# Or using psql:
psql -U postgres
CREATE DATABASE apiforge;
\q

# Copy environment file
cp apps/api-server/.env.example apps/api-server/.env

# Edit the DATABASE_URL in apps/api-server/.env
# Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/apiforge"
```

## Step 3: Initialize Database (1 min)

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

## Step 4: Build & Start (1 min)

```bash
# Build all packages
pnpm build

# Start development servers
pnpm dev
```

## Step 5: Access & Test

Open your browser:
- **Dashboard**: http://localhost:3000
- **API Server**: http://localhost:4000/api/projects

## First Steps Tutorial

### 1. Create Your First Project

1. Go to http://localhost:3000
2. Click "New Project"
3. Enter:
   - Name: "My API"
   - Description: "Test project"
4. Click "Create Project"

### 2. Add Your First API

1. Click on your project
2. Click "Add API"
3. Fill in the form:
   ```
   Name: Login
   Method: POST
   Endpoint: /auth/login
   Local URL: http://localhost:3000
   Production URL: https://api.example.com
   
   Response Mapping:
   - Success Path: success
   - Message Path: message
   - Data Path: data
   ```
4. Click "Create API"

### 3. Export SDK

1. Click "Export SDK"
2. Select languages:
   - ✅ TypeScript
   - ✅ Dart
3. Click "Export SDK"
4. Download `apiforge-sdk.zip`

### 4. Use Generated Code

Extract the ZIP and check the generated files:

```
apiforge-sdk.zip
├── typescript/
│   ├── login.ts
│   └── index.ts
├── dart/
│   ├── login_api.dart
│   └── index.dart
└── config.json
```

**TypeScript Example:**
```typescript
import { LoginApi } from './typescript/login';

const response = await LoginApi.login({
  email: "test@example.com",
  password: "password123"
});

console.log(response.success);
console.log(response.data);
```

**Dart Example:**
```dart
import 'dart/login_api.dart';

final response = await LoginApi.login(
  LoginRequest(
    email: "test@example.com",
    password: "password123",
  ),
);

print(response.success);
print(response.data);
```

## Common Issues & Solutions

### Port Already in Use

**Problem**: Port 3000 or 4000 is already in use

**Solution**:
```bash
# Change API port in apps/api-server/.env
PORT=4001

# Update frontend API URL in apps/dashboard-web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

### Database Connection Failed

**Problem**: Can't connect to PostgreSQL

**Solution**:
1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   
   # Windows
   # Start PostgreSQL service from Services
   ```

2. Check credentials in `apps/api-server/.env`
3. Test connection:
   ```bash
   psql -U postgres -d apiforge
   ```

### Build Errors

**Problem**: Build fails with errors

**Solution**:
```bash
# Clean everything
pnpm clean

# Reinstall dependencies
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install

# Rebuild
pnpm build
```

### Prisma Client Not Generated

**Problem**: Import errors for @prisma/client

**Solution**:
```bash
cd apps/api-server
pnpm prisma generate
```

## Development Tips

### Hot Reload
Both frontend and backend support hot reload. Just save your files and see changes instantly.

### Database GUI
```bash
# Open Prisma Studio
pnpm db:studio
```

### View Logs
```bash
# Backend logs are in the terminal running pnpm dev
# Frontend logs are in browser console
```

### Reset Database
```bash
cd apps/api-server
pnpm prisma migrate reset
# Warning: This deletes all data!
```

## Next Steps

1. **Read Documentation**
   - SETUP.md - Detailed setup guide
   - ARCHITECTURE.md - System design
   - CONTRIBUTING.md - How to contribute

2. **Explore Features**
   - Add multiple APIs
   - Try different HTTP methods
   - Test response mapping
   - Import/Export configs

3. **Customize**
   - Modify templates in `/templates`
   - Add custom headers
   - Configure timeouts
   - Add query parameters

4. **Extend**
   - Add new language generators
   - Create custom templates
   - Integrate with your workflow

## Getting Help

- **Documentation**: Check SETUP.md and ARCHITECTURE.md
- **Issues**: Open a GitHub issue
- **Questions**: Start a discussion

## Production Deployment

Ready to deploy? See SETUP.md for:
- Environment variables
- Build commands
- Deployment strategies
- Security considerations

---

**You're all set!** 🎉

Start building amazing API SDKs with ApiForge!
