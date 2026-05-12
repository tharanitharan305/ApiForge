# ApiForge Development Guide

## Development Workflow

### Daily Development

```bash
# Start development servers
pnpm dev

# This starts:
# - Dashboard: http://localhost:3000 (with hot reload)
# - API Server: http://localhost:4000 (with hot reload)
```

### Making Changes

#### 1. Modifying Frontend

```bash
# Navigate to dashboard
cd apps/dashboard-web

# Files to edit:
# - src/app/* - Pages
# - src/components/* - React components
# - src/lib/* - Utilities

# Changes auto-reload in browser
```

#### 2. Modifying Backend

```bash
# Navigate to API server
cd apps/api-server

# Files to edit:
# - src/*/*.controller.ts - API endpoints
# - src/*/*.service.ts - Business logic
# - src/*/*.dto.ts - Data transfer objects

# Changes auto-reload server
```

#### 3. Modifying Database Schema

```bash
cd apps/api-server

# Edit prisma/schema.prisma
# Then push changes:
pnpm prisma db push

# Or create migration:
pnpm prisma migrate dev --name your_migration_name
```

#### 4. Adding New Generator

```bash
# 1. Create package
mkdir -p packages/generator-{language}/src

# 2. Create package.json (see CONTRIBUTING.md)

# 3. Implement generator
# packages/generator-{language}/src/index.ts

# 4. Create templates
# templates/{language}/api.hbs
# templates/{language}/index.hbs

# 5. Register in generator service
# apps/api-server/src/generator/generator.service.ts

# 6. Rebuild
pnpm build
```

### Testing Changes

#### Manual Testing

```bash
# 1. Start dev servers
pnpm dev

# 2. Open browser
open http://localhost:3000

# 3. Test workflow:
# - Create project
# - Add API
# - Export SDK
# - Check generated files
```

#### API Testing

```bash
# Using curl
curl http://localhost:4000/api/projects

# Using httpie
http GET http://localhost:4000/api/projects

# Using Postman/Insomnia
# Import API endpoints from SETUP.md
```

#### Database Inspection

```bash
# Open Prisma Studio
pnpm db:studio

# Or use psql
psql -U postgres -d apiforge
\dt  # List tables
SELECT * FROM projects;
```

### Code Quality

#### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
cd apps/dashboard-web
pnpm lint
```

#### Type Checking

```bash
# Check types in all packages
pnpm build

# Check specific package
cd packages/core
pnpm build
```

#### Formatting

```bash
# Format code (if Prettier configured)
pnpm format
```

### Debugging

#### Frontend Debugging

```bash
# 1. Open browser DevTools (F12)
# 2. Check Console for errors
# 3. Use React DevTools extension
# 4. Check Network tab for API calls
```

#### Backend Debugging

```bash
# 1. Add console.log or debugger
# 2. Check terminal output
# 3. Use NestJS logger:

import { Logger } from '@nestjs/common';
const logger = new Logger('YourClass');
logger.log('Debug message');
logger.error('Error message');
```

#### Database Debugging

```bash
# Enable Prisma query logging
# In apps/api-server/src/prisma/prisma.service.ts

constructor() {
  super({
    log: ['query', 'info', 'warn', 'error'],
  });
}
```

### Common Tasks

#### Reset Database

```bash
cd apps/api-server
pnpm prisma migrate reset
# Warning: Deletes all data!
```

#### Clean Build

```bash
# Clean all build artifacts
pnpm clean

# Rebuild everything
pnpm build
```

#### Update Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update axios

# Check outdated packages
pnpm outdated
```

#### Add New Dependency

```bash
# Add to specific package
cd apps/dashboard-web
pnpm add package-name

# Add to workspace root
pnpm add -w package-name

# Add dev dependency
pnpm add -D package-name
```

### Project Structure Navigation

```
apiforge/
├── apps/
│   ├── dashboard-web/     # Frontend development
│   │   ├── src/app/      # Next.js pages
│   │   ├── src/components/ # React components
│   │   └── src/lib/      # Utilities
│   │
│   └── api-server/       # Backend development
│       ├── src/api/      # API module
│       ├── src/project/  # Project module
│       ├── src/generator/ # Generator module
│       └── src/export/   # Export module
│
├── packages/             # Shared packages
│   ├── core/            # Types
│   ├── schema/          # Validation
│   ├── generator-*/     # Generators
│   └── shared-utils/    # Utilities
│
└── templates/           # Code templates
    ├── dart/
    ├── typescript/
    ├── javascript/
    └── python/
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

### Commit Message Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Performance Optimization

#### Frontend

```bash
# Analyze bundle size
cd apps/dashboard-web
pnpm build
# Check .next/analyze

# Optimize images
# Use Next.js Image component
import Image from 'next/image';
```

#### Backend

```bash
# Profile API endpoints
# Add timing logs

const start = Date.now();
// ... operation
const duration = Date.now() - start;
logger.log(`Operation took ${duration}ms`);
```

#### Database

```bash
# Add indexes in schema.prisma
@@index([userId])
@@index([projectId])

# Optimize queries
# Use select to fetch only needed fields
# Use include for relations
```

### Troubleshooting

#### Port Conflicts

```bash
# Find process using port
lsof -i :3000
lsof -i :4000

# Kill process
kill -9 <PID>

# Or change port in .env
```

#### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install

# Rebuild packages
pnpm build
```

#### Prisma Issues

```bash
# Regenerate client
cd apps/api-server
pnpm prisma generate

# Reset database
pnpm prisma migrate reset

# Push schema
pnpm prisma db push
```

#### TypeScript Errors

```bash
# Clean build
pnpm clean
pnpm build

# Check tsconfig.json
# Ensure paths are correct
```

### IDE Setup

#### VS Code

Recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

Settings:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### WebStorm

- Enable TypeScript support
- Configure Prisma plugin
- Setup ESLint integration

### Useful Commands

```bash
# View all available scripts
pnpm run

# Run specific app
cd apps/dashboard-web
pnpm dev

# Build specific package
cd packages/core
pnpm build

# Watch mode for package
cd packages/core
pnpm build --watch

# Database commands
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to DB
pnpm db:studio    # Open Prisma Studio
```

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL="postgresql://..."
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### Best Practices

1. **Always run `pnpm build` after package changes**
2. **Use TypeScript strict mode**
3. **Validate inputs with Zod**
4. **Write meaningful commit messages**
5. **Test changes before committing**
6. **Keep packages focused and small**
7. **Document complex logic**
8. **Use consistent naming conventions**

### Getting Help

- Check documentation files
- Search existing issues
- Ask in discussions
- Review code examples

### Next Steps

1. Read ARCHITECTURE.md for system design
2. Check CONTRIBUTING.md for guidelines
3. Explore existing code
4. Start with small changes
5. Ask questions when stuck

---

Happy coding! 🚀
