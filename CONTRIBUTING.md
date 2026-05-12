# Contributing to ApiForge

Thank you for your interest in contributing to ApiForge!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Setup database (see SETUP.md)
4. Start development: `pnpm dev`

## Project Structure

- `/apps` - Applications (dashboard, api-server)
- `/packages` - Shared packages and generators
- `/templates` - Handlebars templates for code generation

## Adding a New Language Generator

### 1. Create Generator Package

```bash
mkdir -p packages/generator-{language}/src
```

### 2. Create package.json

```json
{
  "name": "@apiforge/generator-{language}",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@apiforge/core": "workspace:*",
    "@apiforge/generator-core": "workspace:*",
    "@apiforge/shared-utils": "workspace:*",
    "handlebars": "^4.7.8"
  }
}
```

### 3. Implement Generator

```typescript
// packages/generator-{language}/src/index.ts
import { BaseGenerator } from '@apiforge/generator-core';
import { ApiDefinition, GeneratedFile } from '@apiforge/core';

export class {Language}Generator extends BaseGenerator {
  language = '{language}';
  fileExtension = '{ext}';

  async generateApi(api: ApiDefinition): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.apiTemplate, api);
    return {
      filename: this.getFilename(api.name),
      content,
      language: this.language,
    };
  }

  async generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.indexTemplate, { apis });
    return {
      filename: `index.${this.fileExtension}`,
      content,
      language: this.language,
    };
  }
}
```

### 4. Create Templates

Create templates in `templates/{language}/`:
- `api.hbs` - Individual API service
- `index.hbs` - Index/export file

### 5. Register Generator

Add to `apps/api-server/src/generator/generator.service.ts`:

```typescript
import { {Language}Generator } from '@apiforge/generator-{language}';

onModuleInit() {
  generatorRegistry.register(new {Language}Generator());
}
```

### 6. Update UI

Add language option in `apps/dashboard-web/src/components/export-dialog.tsx`:

```typescript
const LANGUAGES = [
  // ...
  { id: '{language}', label: '{Language Name}' },
];
```

## Code Style

- Use TypeScript for all code
- Follow existing patterns and conventions
- Use Prettier for formatting
- Write meaningful commit messages

## Testing

```bash
# Run tests (when implemented)
pnpm test

# Lint code
pnpm lint
```

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit PR with clear description

## Code Review

- All PRs require review
- Address feedback promptly
- Keep PRs focused and small

## Questions?

Open an issue for discussion before starting major changes.
