# Postman Import/Export UI Features

## Overview
The dashboard now includes full UI support for importing Postman collections and exporting projects back to Postman format.

## Features Added

### 1. Import from Postman (Home Page)
**Location**: Home page (`/`)

**Button**: "Import Postman" button in the top-right header

**Functionality**:
- Opens a dialog to upload Postman Collection v2.1 JSON files
- Validates the JSON structure before import
- Shows a preview of the collection (name, description, item count)
- Creates a new project with all collections and APIs
- Automatically redirects to the newly created project
- Displays helpful information about what will be imported

**What Gets Imported**:
- Project structure and collections
- API endpoints with methods and URLs
- Request headers and body schemas
- Query parameters and authentication
- Nested folder structures (folders → collections)

### 2. Export to Postman (Project Page)
**Location**: Project detail page (`/projects/[id]`)

**Button**: "Export Postman" button in the left sidebar (bottom section)

**Functionality**:
- Exports the current project to Postman Collection v2.1 JSON format
- Downloads as `.postman_collection.json` file
- Can be imported directly into:
  - Postman
  - Thunder Client
  - Insomnia
- Reconstructs full URLs from: `baseUrl + collectionPath + endpoint`
- Includes all headers, body schemas, query parameters, and auth

**Disabled State**: Button is disabled when the project has no APIs

### 3. Export SDK (Existing Feature)
**Location**: Project detail page (`/projects/[id]`)

**Button**: "Export SDK" button in the left sidebar

**Functionality**:
- Opens a dialog to select programming languages
- Generates SDK ZIP files for:
  - JavaScript
  - TypeScript
  - Python
  - Dart
- Includes validation to prevent empty/broken exports

## UI Components

### ImportPostmanDialog
**File**: `apps/dashboard-web/src/components/import-postman-dialog.tsx`

**Features**:
- File upload with drag-and-drop area
- JSON validation
- Collection preview
- Error handling with detailed messages
- Loading states
- Informational panel explaining what will be imported

### Updated Dialog Component
**File**: `apps/dashboard-web/src/components/ui/dialog.tsx`

**Added**:
- `DialogDescription` - For dialog subtitles
- `DialogFooter` - For action buttons at the bottom

## API Integration

### New API Methods
**File**: `apps/dashboard-web/src/lib/api.ts`

```typescript
// Import Postman collection
api.import.postman(file: File)

// Export project to Postman
api.export.exportPostman(projectId: string)
```

## User Flow

### Import Flow
1. User clicks "Import Postman" on home page
2. Dialog opens with file upload area
3. User selects `.json` file
4. System validates and shows preview
5. User clicks "Import Collection"
6. System creates project with all data
7. User is redirected to the new project

### Export Flow
1. User opens a project
2. User clicks "Export Postman" in sidebar
3. System generates Postman Collection JSON
4. File downloads automatically as `[project-name].postman_collection.json`
5. User can import this file into Postman/Thunder Client/Insomnia

## Testing

### To Test Import:
1. Go to http://localhost:3001
2. Click "Import Postman"
3. Upload a Postman Collection v2.1 JSON file
4. Verify the preview shows correct information
5. Click "Import Collection"
6. Verify you're redirected to the new project
7. Verify all collections and APIs are created correctly

### To Test Export:
1. Go to an existing project with APIs
2. Click "Export Postman" in the sidebar
3. Verify the JSON file downloads
4. Open the file in a text editor and verify structure
5. Import the file into Postman/Thunder Client
6. Verify all requests are correct with proper URLs, headers, and bodies

## Backend Endpoints Used

- `POST /api/import/postman` - Import Postman collection
- `POST /api/projects/:projectId/export/postman` - Export to Postman

## Error Handling

### Import Errors:
- Invalid JSON format
- Missing required Postman fields
- Malformed collection structure
- Server-side parsing errors

### Export Errors:
- Project not found
- No APIs to export
- Server-side generation errors

All errors are displayed in user-friendly dialogs with actionable messages.

## Visual Design

- Uses consistent shadcn/ui components
- Matches existing dashboard design
- Clear icons (Upload, FileJson)
- Color-coded status indicators (green for success, red for errors)
- Responsive layout
- Loading states for async operations

## Next Steps

The UI is now complete and ready to use. Both import and export features are fully functional and integrated with the backend API.
