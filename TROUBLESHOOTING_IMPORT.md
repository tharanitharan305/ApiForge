# Troubleshooting Postman Import

## Current Status

✅ **API Server**: Running on http://localhost:4000  
✅ **Dashboard**: Running on http://localhost:3001  
✅ **Backend Endpoint**: `/api/import/postman` exists and works via direct API calls  
❌ **UI Import**: Getting 500 error when importing from browser  

## What Works

The backend API endpoint works correctly when called directly:

```powershell
# This works successfully
$collection = Get-Content test-postman-collection.json -Raw | ConvertFrom-Json
$body = @{collection=$collection} | ConvertTo-Json -Depth 100
Invoke-RestMethod -Uri "http://localhost:4000/api/import/postman" -Method POST -Body $body -ContentType "application/json"
```

## What Doesn't Work

When importing from the UI (browser), we get a 500 Internal Server Error.

## Debugging Steps Added

Added console logging to the import controller to help diagnose the issue:

```typescript
@Post('postman')
async importPostman(@Body() body: { collection: any }) {
  try {
    console.log('Received import request');
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body || {}));
    console.log('Collection type:', typeof body?.collection);
    
    if (typeof body?.collection === 'string') {
      console.log('Collection is a string, parsing...');
      body.collection = JSON.parse(body.collection);
    }
    
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
    return this.exportService.importPostmanCollection(body.collection, MOCK_USER_ID);
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
}
```

## Next Steps

1. Try importing from the UI at http://localhost:3001
2. Check the API server logs for the console output
3. The logs will show:
   - What type of data is being received
   - Whether the collection is a string or object
   - The actual error that's occurring

## Possible Issues

### 1. Double JSON Encoding
The collection might be getting stringified twice:
- Once by the UI when reading the file
- Again by axios when sending the request

### 2. Request Body Parsing
NestJS might not be parsing the request body correctly due to:
- Content-Type mismatch
- Body size limits
- JSON parsing middleware issues

### 3. Validation Pipe
The global validation pipe might be rejecting the request:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true, // This might be rejecting unknown fields
  }),
);
```

## How to Test

### From UI:
1. Go to http://localhost:3001
2. Click "Import Postman"
3. Select `test-postman-collection.json`
4. Click "Import Collection"
5. Check browser console for errors
6. Check API server terminal for logs

### From Command Line:
```powershell
# Test with PowerShell
$collection = Get-Content test-postman-collection.json -Raw | ConvertFrom-Json
$body = @{collection=$collection} | ConvertTo-Json -Depth 100
Invoke-RestMethod -Uri "http://localhost:4000/api/import/postman" -Method POST -Body $body -ContentType "application/json"
```

## Files to Check

- `apps/api-server/src/export/export.controller.ts` - Import endpoint
- `apps/api-server/src/export/export.service.ts` - Import logic
- `apps/api-server/src/export/services/postman-parser.service.ts` - Parsing logic
- `apps/dashboard-web/src/lib/api.ts` - API client
- `apps/dashboard-web/src/components/import-postman-dialog.tsx` - UI component

## Expected Behavior

When working correctly:
1. User selects JSON file
2. UI reads file and parses JSON
3. UI sends `{ collection: <object> }` to API
4. API validates and parses collection
5. API creates project with collections and APIs
6. API returns project data
7. UI redirects to new project

## Current Error

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Import failed: AxiosError: Request failed with status code 500
```

The 500 error indicates a server-side exception. The console logging will help identify the exact cause.
