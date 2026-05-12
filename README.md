# ApiForge

> Production-grade open-source platform for generating API SDK/service files from unified API configurations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com/)

## ✨ Features

### Version 1.0 (Current)

- 🎯 **Intuitive Dashboard** - Manage projects and API endpoints through a modern UI
- 🚀 **Multi-Language Generation** - Generate SDKs for Dart, TypeScript, JavaScript, and Python
- 📦 **Export System** - Download ZIP packages with all generated code
- 🔄 **Import/Export Config** - Save and restore API configurations as JSON
- 🎨 **Modern UI** - Dark mode, responsive design, built with shadcn/ui
- ✅ **Production-Ready Code** - Generated SDKs include error handling, types, and documentation
- 🔧 **Response Normalization** - Unified response structure across all languages
- 🏗️ **Plugin Architecture** - Easily extensible for new languages

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL

### Installation (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
cp apps/api-server/.env.example apps/api-server/.env
# Edit .env with your DATABASE_URL

# 3. Initialize database
pnpm db:generate
pnpm db:push

# 4. Build packages
pnpm build

# 5. Start development
pnpm dev
```

**Access:**
- Dashboard: http://localhost:3000
- API Server: http://localhost:4000

📖 **Detailed guide:** See [QUICKSTART.md](QUICKSTART.md)

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Detailed installation and configuration
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and patterns
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow and tips
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

## 🎯 Supported Languages

| Language | HTTP Client | Type Safety | Status |
|----------|-------------|-------------|--------|
| **Dart/Flutter** | dio | ✅ Full | ✅ Ready |
| **TypeScript** | axios | ✅ Full | ✅ Ready |
| **JavaScript** | axios | ⚠️ JSDoc | ✅ Ready |
| **Python** | requests | ✅ TypedDict | ✅ Ready |

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui (Radix UI)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** class-validator, Zod
- **Templates:** Handlebars

### Monorepo
- **Tool:** TurboRepo
- **Package Manager:** pnpm
- **Workspaces:** 2 apps + 9 packages

## 📁 Project Structure

```
apiforge/
├── apps/
│   ├── dashboard-web/          # Next.js frontend
│   └── api-server/             # NestJS backend
├── packages/
│   ├── core/                   # Core types
│   ├── schema/                 # Zod schemas
│   ├── generator-core/         # Base generator
│   ├── generator-dart/         # Dart generator
│   ├── generator-ts/           # TypeScript generator
│   ├── generator-js/           # JavaScript generator
│   ├── generator-python/       # Python generator
│   └── shared-utils/           # Utilities
└── templates/                  # Handlebars templates
    ├── dart/
    ├── typescript/
    ├── javascript/
    └── python/
```

## 🎨 Screenshots

### Dashboard
Modern, dark-mode interface for managing projects:
- Project cards with API counts
- Quick actions for export/import
- Responsive design

### API Management
Comprehensive API endpoint configuration:
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Environment URLs (local/production)
- Headers, query params, request body
- Response mapping configuration

### Export System
Multi-language SDK generation:
- Select target languages
- Download ZIP with all SDKs
- Include config.json for re-import

## 🔧 Usage Example

### 1. Create a Project

```typescript
// Via Dashboard UI
Project Name: "My API"
Description: "User authentication API"
```

### 2. Add API Endpoint

```typescript
Name: "Login"
Method: POST
Endpoint: /auth/login
Local URL: http://localhost:3000
Production URL: https://api.example.com

Response Mapping:
  Success Path: success
  Message Path: message
  Data Path: data
```

### 3. Export SDK

Select languages → Download ZIP

### 4. Use Generated Code

**TypeScript:**
```typescript
import { LoginApi } from './typescript/login';

const response = await LoginApi.login({
  email: "user@example.com",
  password: "password123"
});

console.log(response.success);  // true/false
console.log(response.data);     // user data
console.log(response.message);  // "Login successful"
```

**Dart:**
```dart
import 'dart/login_api.dart';

final response = await LoginApi.login(
  LoginRequest(
    email: "user@example.com",
    password: "password123",
  ),
);

print(response.success);
print(response.data);
```

**Python:**
```python
from python.login_api import LoginApi

response = LoginApi.login({
    'email': 'user@example.com',
    'password': 'password123'
})

print(response['success'])
print(response['data'])
```

## 🏗️ Architecture Highlights

### Plugin-Based Generators

```typescript
interface GeneratorPlugin {
  language: string;
  fileExtension: string;
  generateApi(api: ApiDefinition): Promise<GeneratedFile>;
  generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile>;
}
```

Each language generator is an independent plugin that extends `BaseGenerator`.

### Response Normalization

All SDKs normalize responses to a consistent structure:

```typescript
interface NormalizedResponse<T = any> {
  success: boolean;      // Operation success
  statusCode: number;    // HTTP status
  message: string;       // User message
  data: T;              // Response data
  raw: any;             // Original response
}
```

### Clean Architecture

- **Separation of Concerns:** Modules, services, controllers
- **Type Safety:** 100% TypeScript with Zod validation
- **Extensibility:** Plugin-based generator system
- **Maintainability:** Reusable abstractions, DRY principles

## 🚦 Roadmap

### ✅ Version 1.0 (Current)
- Project and API management
- Multi-language SDK generation
- Export/Import functionality
- Modern dashboard UI

### 🔜 Version 2.0 (Planned)
- [ ] Authentication & authorization
- [ ] Team collaboration
- [ ] Firebase real-time sync
- [ ] Package publishing (npm, pub.dev, PyPI)
- [ ] OpenAPI/Swagger import
- [ ] AI-assisted generation
- [ ] GraphQL support
- [ ] Custom templates
- [ ] Webhook integrations
- [ ] Analytics dashboard

### 🔮 Version 3.0 (Future)
- [ ] Multi-tenancy
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Docker & Kubernetes
- [ ] CI/CD integration
- [ ] Monitoring & alerting

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Adding new generators
- Code style guidelines
- Pull request process

### Adding a New Language

1. Create generator package in `packages/generator-{language}`
2. Extend `BaseGenerator` class
3. Create templates in `templates/{language}/`
4. Register in `GeneratorService`
5. Update UI language options

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## 📊 Project Stats

- **Total Packages:** 9
- **Total Apps:** 2
- **Language Generators:** 4
- **Templates:** 8
- **API Endpoints:** 13
- **Lines of Code:** ~5000+
- **Type Safety:** 100% TypeScript

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change ports in .env files
PORT=4001  # Backend
NEXT_PUBLIC_API_URL=http://localhost:4001/api  # Frontend
```

### Database Connection Issues
```bash
# Ensure PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

### Build Errors
```bash
pnpm clean
pnpm install
pnpm build
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for more troubleshooting tips.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source projects:
- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [TurboRepo](https://turbo.build/) - Monorepo tool
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Handlebars](https://handlebarsjs.com/) - Template engine

## 📞 Support

- **Documentation:** Check the docs folder
- **Issues:** [GitHub Issues](https://github.com/yourusername/apiforge/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/apiforge/discussions)

## ⭐ Star History

If you find ApiForge useful, please consider giving it a star!

---

**Built with ❤️ for developers, by developers**

[Get Started](QUICKSTART.md) | [Documentation](SETUP.md) | [Contributing](CONTRIBUTING.md)
