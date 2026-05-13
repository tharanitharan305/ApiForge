# UI Button Locations - Quick Reference

## Home Page (http://localhost:3001)

```
┌─────────────────────────────────────────────────────────────┐
│  ApiForge                          [Import Postman] [New Project]  │
│  Generate production-ready API SDKs                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Project  │  │ Project  │  │ Project  │                │
│  │   Card   │  │   Card   │  │   Card   │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**New Button**: `[Import Postman]` - Top-right, next to "New Project"

---

## Project Detail Page (http://localhost:3001/projects/[id])

```
┌──────────────┬──────────────────────────────────────────────┐
│              │                                              │
│  [← Back]    │  Collection Name                            │
│              │  Description                                 │
│  Project     │  Base URL: http://localhost:3000/auth       │
│              │                                              │
│ COLLECTIONS  │  [Delete Collection]  [Add API]             │
│  [+]         │                                              │
│              ├──────────────────────────────────────────────┤
│ ┌──────────┐ │                                              │
│ │ Auth     │ │  API Table:                                 │
│ │ /auth    │ │  - POST /login                              │
│ │ 3 APIs   │ │  - POST /logout                             │
│ └──────────┘ │  - GET /me                                  │
│              │                                              │
│ ┌──────────┐ │                                              │
│ │ Users    │ │                                              │
│ │ /users   │ │                                              │
│ │ 2 APIs   │ │                                              │
│ └──────────┘ │                                              │
│              │                                              │
│──────────────│                                              │
│              │                                              │
│ [Import      │                                              │
│  Config]     │                                              │
│              │                                              │
│ [Export SDK] │                                              │
│              │                                              │
│ [Export      │  ← NEW BUTTON                               │
│  Postman]    │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**New Button**: `[Export Postman]` - Left sidebar, bottom section, below "Export SDK"

---

## Button Details

### Import Postman (Home Page)
- **Location**: Top-right header
- **Icon**: 📤 Upload icon
- **Text**: "Import Postman"
- **Style**: Outline button
- **Action**: Opens import dialog

### Export Postman (Project Page)
- **Location**: Left sidebar, bottom section
- **Icon**: 📄 FileJson icon
- **Text**: "Export Postman"
- **Style**: Outline button, small size
- **Action**: Downloads JSON file
- **Disabled**: When project has 0 APIs

### Import Config (Project Page)
- **Location**: Left sidebar, bottom section (renamed from "Import")
- **Icon**: 📤 Upload icon
- **Text**: "Import Config"
- **Style**: Outline button, small size
- **Action**: Import internal config JSON

### Export SDK (Project Page)
- **Location**: Left sidebar, bottom section
- **Icon**: 📥 Download icon
- **Text**: "Export SDK"
- **Style**: Outline button, small size
- **Action**: Opens SDK export dialog
- **Disabled**: When project has 0 APIs

---

## Visual Hierarchy

### Home Page Header
```
[Import Postman]  [New Project]
     ↑                  ↑
  Secondary         Primary
   Action           Action
```

### Project Sidebar (Bottom Section)
```
[Import Config]    ← Internal config import
[Export SDK]       ← Generate SDK ZIP
[Export Postman]   ← NEW: Export to Postman
```

All three buttons are the same size and style (outline, small) for visual consistency.

---

## Quick Access

1. **To Import Postman Collection**:
   - Go to home page
   - Click "Import Postman" (top-right)

2. **To Export to Postman**:
   - Open any project
   - Scroll to sidebar bottom
   - Click "Export Postman"

3. **To Export SDK**:
   - Open any project
   - Scroll to sidebar bottom
   - Click "Export SDK"
