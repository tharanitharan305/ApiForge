import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  PostmanCollection,
  PostmanItem,
  PostmanRequest,
  PostmanUrl,
  PostmanBody,
  ParsedPostmanCollection,
  ParsedCollection,
  ParsedApi,
} from '../types/postman.types';

export interface ImportWarning {
  type: 'skipped_request' | 'invalid_url' | 'invalid_body' | 'missing_data';
  message: string;
  requestName?: string;
}

@Injectable()
export class PostmanParserService {
  private readonly logger = new Logger(PostmanParserService.name);
  private warnings: ImportWarning[] = [];

  /**
   * Parse Postman Collection JSON into internal structure
   * DEFENSIVE: Handles missing fields, invalid data, and edge cases
   */
  parseCollection(postmanJson: any): ParsedPostmanCollection & { warnings: ImportWarning[] } {
    this.warnings = [];

    // Validate Postman schema
    this.validatePostmanCollection(postmanJson);

    const collection = postmanJson as PostmanCollection;

    // Extract project info (with fallbacks)
    const projectName = collection.info?.name || 'Imported Project';
    const projectDescription = collection.info?.description || '';

    // Parse all requests to detect base URL and collections
    const allRequests = this.extractAllRequests(collection.item || []);

    if (allRequests.length === 0) {
      this.logger.warn('No valid requests found in Postman collection');
    }

    // Detect base URL from requests
    const baseUrl = this.detectBaseUrl(allRequests);

    // Group requests into collections
    const collections = this.groupIntoCollections(allRequests, baseUrl);

    // Extract global headers
    const globalHeaders = this.extractGlobalHeaders(collection);

    return {
      projectName,
      projectDescription,
      baseUrl,
      collections,
      globalHeaders,
      globalAuth: collection.auth,
      warnings: this.warnings,
    };
  }

  /**
   * Validate Postman Collection structure
   */
  private validatePostmanCollection(json: any): void {
    if (!json || typeof json !== 'object') {
      throw new BadRequestException('Invalid Postman collection: not a valid JSON object');
    }

    if (!json.info) {
      throw new BadRequestException('Invalid Postman collection: missing "info" field');
    }

    if (!json.info.name) {
      throw new BadRequestException('Invalid Postman collection: missing "info.name" field');
    }

    if (!json.item) {
      throw new BadRequestException('Invalid Postman collection: missing "item" field');
    }

    if (!Array.isArray(json.item)) {
      throw new BadRequestException('Invalid Postman collection: "item" must be an array');
    }

    // Check schema version (warning only)
    const schema = json.info?.schema || json.info?._postman_schema;
    if (schema && !schema.includes('v2.1') && !schema.includes('v2.0')) {
      this.logger.warn(`Postman collection schema ${schema} may not be fully supported`);
      this.warnings.push({
        type: 'missing_data',
        message: `Collection schema ${schema} may not be fully supported. Expected v2.0 or v2.1`,
      });
    }
  }

  /**
   * Extract all requests from nested folder structure
   * DEFENSIVE: Handles missing fields and invalid items
   */
  private extractAllRequests(
    items: PostmanItem[],
    folderPath: string[] = [],
  ): Array<{ request: PostmanRequest; name: string; folderPath: string[] }> {
    const requests: Array<{ request: PostmanRequest; name: string; folderPath: string[] }> = [];

    if (!Array.isArray(items)) {
      this.logger.warn('Items is not an array, skipping');
      return requests;
    }

    for (const item of items) {
      if (!item || typeof item !== 'object') {
        this.logger.warn('Invalid item in collection, skipping');
        continue;
      }

      try {
        if (item.request) {
          // This is a request
          const name = item.name || 'Unnamed Request';
          
          // Validate request has minimum required fields
          if (!this.isValidRequest(item.request)) {
            this.logger.warn(`Skipping invalid request: ${name}`);
            this.warnings.push({
              type: 'skipped_request',
              message: `Skipped request "${name}": Missing URL or method`,
              requestName: name,
            });
            continue;
          }

          requests.push({
            request: item.request,
            name,
            folderPath,
          });
        } else if (item.item && Array.isArray(item.item)) {
          // This is a folder - recurse
          const folderName = item.name || 'Unnamed Folder';
          const nestedRequests = this.extractAllRequests(item.item, [...folderPath, folderName]);
          requests.push(...nestedRequests);
        }
      } catch (error) {
        this.logger.error(`Error processing item: ${error.message}`);
        this.warnings.push({
          type: 'skipped_request',
          message: `Skipped item due to error: ${error.message}`,
          requestName: item.name,
        });
      }
    }

    return requests;
  }

  /**
   * Check if request has minimum required fields
   */
  private isValidRequest(request: any): boolean {
    if (!request || typeof request !== 'object') {
      return false;
    }

    // Must have a method
    if (!request.method || typeof request.method !== 'string') {
      return false;
    }

    // Must have a URL (either string or object)
    if (!request.url) {
      return false;
    }

    // If URL is object, it should have at least host or path
    if (typeof request.url === 'object') {
      const hasHost = request.url.host && (Array.isArray(request.url.host) ? request.url.host.length > 0 : true);
      const hasPath = request.url.path && Array.isArray(request.url.path) && request.url.path.length > 0;
      const hasRaw = request.url.raw && typeof request.url.raw === 'string';
      
      if (!hasHost && !hasPath && !hasRaw) {
        return false;
      }
    }

    return true;
  }

  /**
   * Detect base URL from all requests
   * DEFENSIVE: Handles missing URLs and invalid data
   */
  private detectBaseUrl(
    requests: Array<{ request: PostmanRequest; name: string; folderPath: string[] }>,
  ): string {
    const DEFAULT_BASE_URL = 'http://localhost:3000';

    if (!requests || requests.length === 0) {
      this.logger.warn('No requests to detect base URL from, using default');
      return DEFAULT_BASE_URL;
    }

    try {
      // Get all valid URLs
      const urls = requests
        .map((r) => {
          try {
            return this.parseUrl(r.request?.url);
          } catch (error) {
            this.logger.warn(`Failed to parse URL for request "${r.name}": ${error.message}`);
            return null;
          }
        })
        .filter((url): url is NonNullable<typeof url> => url !== null);

      if (urls.length === 0) {
        this.logger.warn('No valid URLs found, using default base URL');
        return DEFAULT_BASE_URL;
      }

      // Find common base URL
      const firstUrl = urls[0];

      // Extract protocol, host, and common path prefix
      const protocol = firstUrl.protocol || 'http';
      const host = firstUrl.host || 'localhost';
      const port = firstUrl.port;

      // Find common path prefix
      const paths = urls.map((u) => u.path || []);
      const commonPath = this.findCommonPathPrefix(paths);

      // Build base URL
      let baseUrl = `${protocol}://${host}`;
      if (port && port !== '80' && port !== '443') {
        baseUrl += `:${port}`;
      }
      if (commonPath.length > 0) {
        baseUrl += '/' + commonPath.join('/');
      }

      return baseUrl;
    } catch (error) {
      this.logger.error(`Error detecting base URL: ${error.message}`);
      return DEFAULT_BASE_URL;
    }
  }

  /**
   * Find common path prefix from multiple paths
   */
  private findCommonPathPrefix(paths: string[][]): string[] {
    if (!paths || paths.length === 0) return [];
    if (paths.length === 1) {
      const path = paths[0] || [];
      return path.slice(0, -1); // Remove last segment (endpoint)
    }

    const commonPrefix: string[] = [];
    const minLength = Math.min(...paths.map((p) => (p || []).length));

    for (let i = 0; i < minLength - 1; i++) {
      // -1 to keep last segment as endpoint
      const segment = paths[0]?.[i];
      if (segment && paths.every((p) => p?.[i] === segment)) {
        commonPrefix.push(segment);
      } else {
        break;
      }
    }

    return commonPrefix;
  }

  /**
   * Group requests into collections based on folder structure or URL patterns
   * DEFENSIVE: Handles missing data and creates default collections
   */
  private groupIntoCollections(
    requests: Array<{ request: PostmanRequest; name: string; folderPath: string[] }>,
    baseUrl: string,
  ): ParsedCollection[] {
    const collectionsMap = new Map<string, ParsedCollection>();

    for (const { request, name, folderPath } of requests) {
      try {
        // Determine collection name
        let collectionName: string;
        let collectionBasePath: string;

        if (folderPath && folderPath.length > 0) {
          // Use folder structure
          collectionName = folderPath[0] || 'Default';
          collectionBasePath = '/' + this.toKebabCase(folderPath[0] || 'default');
        } else {
          // Use URL-based grouping
          try {
            const url = this.parseUrl(request?.url);
            const pathSegments = url?.path || [];
            const basePathSegments = baseUrl.split('/').filter((s) => s);

            // Find path after base URL
            const remainingPath = pathSegments.slice(Math.max(0, basePathSegments.length - 2));

            if (remainingPath.length > 1) {
              collectionName = this.toPascalCase(remainingPath[0] || 'Default');
              collectionBasePath = '/' + (remainingPath[0] || 'default');
            } else {
              collectionName = 'Default';
              collectionBasePath = '';
            }
          } catch (error) {
            this.logger.warn(`Error parsing URL for grouping: ${error.message}`);
            collectionName = 'Default';
            collectionBasePath = '';
          }
        }

        // Get or create collection
        if (!collectionsMap.has(collectionName)) {
          collectionsMap.set(collectionName, {
            name: collectionName,
            description: '',
            basePath: collectionBasePath,
            headers: {},
            apis: [],
          });
        }

        const collection = collectionsMap.get(collectionName)!;

        // Parse API
        const api = this.parseApi(request, name, baseUrl, collectionBasePath);
        if (api) {
          collection.apis.push(api);
        }
      } catch (error) {
        this.logger.error(`Error grouping request "${name}": ${error.message}`);
        this.warnings.push({
          type: 'skipped_request',
          message: `Failed to process request "${name}": ${error.message}`,
          requestName: name,
        });
      }
    }

    return Array.from(collectionsMap.values());
  }

  /**
   * Parse individual API request
   * DEFENSIVE: Handles all missing fields with fallbacks
   */
  private parseApi(
    request: PostmanRequest | null | undefined,
    name: string,
    baseUrl: string,
    collectionBasePath: string,
  ): ParsedApi | null {
    if (!request) {
      this.logger.warn(`Request is null/undefined for "${name}"`);
      return null;
    }

    try {
      const url = this.parseUrl(request.url);

      // Extract endpoint (path after base URL and collection path)
      const pathSegments = url?.path || [];
      
      let endpoint = '/';
      try {
        const baseUrlObj = new URL(baseUrl);
        const basePathSegments = baseUrlObj.pathname.split('/').filter((s) => s);

        // Remove base URL path segments
        let remainingSegments = pathSegments.slice(basePathSegments.length);

        // Remove collection base path segments
        if (collectionBasePath) {
          const collectionSegments = collectionBasePath.split('/').filter((s) => s);
          if (collectionSegments.length > 0) {
            // Check if remaining path starts with collection segments
            const startsWithCollection = collectionSegments.every(
              (seg, idx) => remainingSegments[idx] === seg,
            );
            if (startsWithCollection) {
              remainingSegments = remainingSegments.slice(collectionSegments.length);
            }
          }
        }

        // Build endpoint
        endpoint = '/' + remainingSegments.join('/');
        if (!endpoint || endpoint === '/') {
          endpoint = '/' + (pathSegments[pathSegments.length - 1] || 'endpoint');
        }
      } catch (error) {
        this.logger.warn(`Error building endpoint for "${name}": ${error.message}`);
        endpoint = '/' + (pathSegments[pathSegments.length - 1] || 'endpoint');
      }

      // Parse headers (defensive)
      const headers: Record<string, string> = {};
      if (request.header && Array.isArray(request.header)) {
        for (const header of request.header) {
          if (header && typeof header === 'object' && header.key && !header.disabled) {
            headers[header.key] = String(header.value || '');
          }
        }
      }

      // Parse query parameters (defensive)
      const queryParams = this.parseQueryParams(url?.query || []);

      // Parse request body (defensive)
      const requestBody = this.parseRequestBody(request.body);

      // Detect auth requirement
      const authRequired = !!(request.auth || this.hasAuthHeader(headers));

      // Get method (with fallback)
      const method = (request.method || 'GET').toUpperCase();

      return {
        name: name || 'Unnamed API',
        description: request.description || '',
        method,
        endpoint,
        headers,
        queryParams,
        requestBody,
        authRequired,
      };
    } catch (error) {
      this.logger.error(`Error parsing API "${name}": ${error.message}`);
      this.warnings.push({
        type: 'skipped_request',
        message: `Failed to parse request "${name}": ${error.message}`,
        requestName: name,
      });
      return null;
    }
  }

  /**
   * Parse URL (handle both string and object formats)
   * DEFENSIVE: Handles all edge cases and missing fields
   */
  private parseUrl(url: PostmanUrl | string | null | undefined): {
    protocol: string;
    host: string;
    port?: string;
    path: string[];
    query?: any[];
  } {
    const DEFAULT_RESULT = {
      protocol: 'http',
      host: 'localhost',
      port: undefined,
      path: [],
      query: [],
    };

    if (!url) {
      return DEFAULT_RESULT;
    }

    if (typeof url === 'string') {
      // Parse string URL
      try {
        // Handle empty or whitespace-only strings
        if (!url.trim()) {
          return DEFAULT_RESULT;
        }

        const parsed = new URL(url);
        return {
          protocol: parsed.protocol.replace(':', '') || 'http',
          host: parsed.hostname || 'localhost',
          port: parsed.port || undefined,
          path: parsed.pathname.split('/').filter((s) => s),
          query: [],
        };
      } catch (e) {
        // Fallback for invalid URLs - try to extract path
        const pathMatch = url.match(/\/[^?#]*/);
        const path = pathMatch ? pathMatch[0].split('/').filter((s) => s) : [];
        
        return {
          protocol: 'http',
          host: 'localhost',
          path,
          query: [],
        };
      }
    } else if (typeof url === 'object') {
      // Parse object URL - handle all possible missing fields
      try {
        // Try to use raw URL if available
        if (url.raw && typeof url.raw === 'string') {
          try {
            return this.parseUrl(url.raw);
          } catch (e) {
            // Continue with object parsing
          }
        }

        const protocol = url.protocol || 'http';
        
        // Handle host (can be string or array)
        let host = 'localhost';
        if (url.host) {
          if (Array.isArray(url.host)) {
            host = url.host.filter(Boolean).join('.') || 'localhost';
          } else if (typeof url.host === 'string') {
            host = url.host || 'localhost';
          }
        }

        // Handle path (should be array)
        let path: string[] = [];
        if (url.path) {
          if (Array.isArray(url.path)) {
            path = url.path.filter((p) => p && typeof p === 'string');
          } else if (typeof url.path === 'string') {
            path = (url.path as string).split('/').filter((s) => s);
          }
        }

        // Handle port
        const port = url.port ? String(url.port) : undefined;

        // Handle query
        const query = Array.isArray(url.query) ? url.query : [];

        return {
          protocol,
          host,
          port,
          path,
          query,
        };
      } catch (error) {
        this.logger.warn(`Error parsing URL object: ${error.message}`);
        return DEFAULT_RESULT;
      }
    }

    return DEFAULT_RESULT;
  }

  /**
   * Parse query parameters
   * DEFENSIVE: Handles invalid query params
   */
  private parseQueryParams(
    queryParams: any[] | null | undefined,
  ): Array<{ key: string; type: string; required: boolean; defaultValue: string }> {
    if (!queryParams || !Array.isArray(queryParams)) {
      return [];
    }

    const result: Array<{ key: string; type: string; required: boolean; defaultValue: string }> = [];

    for (const q of queryParams) {
      if (!q || typeof q !== 'object' || q.disabled) {
        continue;
      }

      if (q.key) {
        result.push({
          key: String(q.key),
          type: this.detectType(q.value),
          required: false,
          defaultValue: String(q.value || ''),
        });
      }
    }

    return result;
  }

  /**
   * Parse request body
   * DEFENSIVE: Handles all body modes and invalid JSON
   */
  private parseRequestBody(
    body?: PostmanBody | null,
  ): Array<{ key: string; type: string; required: boolean; defaultValue: string }> {
    if (!body || typeof body !== 'object') {
      return [];
    }

    try {
      if (body.mode === 'raw' && body.raw) {
        try {
          // Attempt to parse as JSON
          const json = JSON.parse(body.raw);
          return this.extractFieldsFromJson(json);
        } catch (e) {
          // Not valid JSON - log warning but don't crash
          this.logger.warn('Request body is not valid JSON, skipping body parsing');
          this.warnings.push({
            type: 'invalid_body',
            message: 'Request body contains invalid JSON and was skipped',
          });
          return [];
        }
      }

      if (body.mode === 'urlencoded' && Array.isArray(body.urlencoded)) {
        return body.urlencoded
          .filter((item) => item && typeof item === 'object' && !item.disabled && item.key)
          .map((item) => ({
            key: String(item.key),
            type: this.detectType(item.value),
            required: false,
            defaultValue: String(item.value || ''),
          }));
      }

      if (body.mode === 'formdata' && Array.isArray(body.formdata)) {
        return body.formdata
          .filter((item) => item && typeof item === 'object' && !item.disabled && item.key)
          .map((item) => ({
            key: String(item.key),
            type: item.type === 'file' ? 'file' : this.detectType(item.value),
            required: false,
            defaultValue: item.type === 'file' ? '' : String(item.value || ''),
          }));
      }
    } catch (error) {
      this.logger.error(`Error parsing request body: ${error.message}`);
      this.warnings.push({
        type: 'invalid_body',
        message: `Failed to parse request body: ${error.message}`,
      });
    }

    return [];
  }

  /**
   * Extract fields from JSON object recursively
   * DEFENSIVE: Handles circular references and deep nesting
   */
  private extractFieldsFromJson(
    json: any,
    prefix: string = '',
    depth: number = 0,
  ): Array<{ key: string; type: string; required: boolean; defaultValue: string }> {
    const fields: Array<{ key: string; type: string; required: boolean; defaultValue: string }> = [];

    // Prevent infinite recursion
    if (depth > 3) {
      return fields;
    }

    if (typeof json !== 'object' || json === null) {
      return fields;
    }

    try {
      for (const [key, value] of Object.entries(json)) {
        if (!key) continue;

        const fullKey = prefix ? `${prefix}.${key}` : key;
        const type = this.detectType(value);

        // Convert value to string safely
        let defaultValue = '';
        try {
          if (value === null || value === undefined) {
            defaultValue = '';
          } else if (typeof value === 'object') {
            defaultValue = JSON.stringify(value);
          } else {
            defaultValue = String(value);
          }
        } catch (e) {
          defaultValue = '';
        }

        fields.push({
          key: fullKey,
          type,
          required: false,
          defaultValue,
        });

        // Recursively handle nested objects (but limit depth)
        if (type === 'object' && typeof value === 'object' && !Array.isArray(value) && value !== null) {
          try {
            const nestedFields = this.extractFieldsFromJson(value, fullKey, depth + 1);
            fields.push(...nestedFields);
          } catch (e) {
            this.logger.warn(`Error extracting nested fields from ${fullKey}: ${e.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error extracting fields from JSON: ${error.message}`);
    }

    return fields;
  }

  /**
   * Detect type from value
   * DEFENSIVE: Always returns a valid type
   */
  private detectType(value: any): string {
    try {
      if (value === null || value === undefined) return 'string';
      if (typeof value === 'boolean') return 'boolean';
      if (typeof value === 'number') return 'number';
      if (Array.isArray(value)) return 'array';
      if (typeof value === 'object') return 'object';
      
      // Try to detect from string value
      const str = String(value);
      if (str === 'true' || str === 'false') return 'boolean';
      if (!isNaN(Number(str)) && str.trim() !== '' && str.trim() !== 'NaN') return 'number';
    } catch (e) {
      // Fallback to string
    }
    
    return 'string';
  }

  /**
   * Extract global headers from collection
   * DEFENSIVE: Handles missing auth data
   */
  private extractGlobalHeaders(collection: PostmanCollection | null | undefined): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!collection || typeof collection !== 'object') {
      return headers;
    }

    try {
      // Check for collection-level auth
      if (collection.auth && typeof collection.auth === 'object') {
        if (collection.auth.type === 'bearer' && Array.isArray(collection.auth.bearer)) {
          const token = collection.auth.bearer.find((b) => b && b.key === 'token');
          if (token && token.value) {
            headers['Authorization'] = `Bearer ${token.value}`;
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Error extracting global headers: ${error.message}`);
    }

    return headers;
  }

  /**
   * Check if headers contain auth
   */
  private hasAuthHeader(headers: Record<string, string> | null | undefined): boolean {
    if (!headers || typeof headers !== 'object') {
      return false;
    }

    return !!(headers['Authorization'] || headers['authorization']);
  }

  /**
   * Convert string to kebab-case
   * DEFENSIVE: Handles null/undefined
   */
  private toKebabCase(str: string | null | undefined): string {
    if (!str) return 'default';
    
    try {
      return String(str)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    } catch (e) {
      return 'default';
    }
  }

  /**
   * Convert string to PascalCase
   * DEFENSIVE: Handles null/undefined
   */
  private toPascalCase(str: string | null | undefined): string {
    if (!str) return 'Default';
    
    try {
      return String(str)
        .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (c) => c.toUpperCase());
    } catch (e) {
      return 'Default';
    }
  }
}
