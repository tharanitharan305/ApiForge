import { Injectable } from '@nestjs/common';
import {
  PostmanCollection,
  PostmanInfo,
  PostmanItem,
  PostmanRequest,
  PostmanUrl,
  PostmanHeader,
  PostmanBody,
  PostmanQueryParam,
} from '../types/postman.types';

@Injectable()
export class PostmanExporterService {
  /**
   * Export internal project structure to Postman Collection v2.1
   */
  exportToPostman(project: any, collections: any[]): PostmanCollection {
    const postmanCollection: PostmanCollection = {
      info: this.createInfo(project),
      item: this.createItems(project, collections),
    };

    return postmanCollection;
  }

  /**
   * Create Postman collection info
   */
  private createInfo(project: any): PostmanInfo {
    return {
      name: project.name,
      description: project.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _postman_id: project.id,
    };
  }

  /**
   * Create Postman items (folders and requests)
   */
  private createItems(project: any, collections: any[]): PostmanItem[] {
    const items: PostmanItem[] = [];

    for (const collection of collections) {
      // Create folder for each collection
      const folder: PostmanItem = {
        name: collection.name,
        description: collection.description || '',
        item: this.createRequests(project, collection),
      };

      items.push(folder);
    }

    return items;
  }

  /**
   * Create Postman requests from APIs
   */
  private createRequests(project: any, collection: any): PostmanItem[] {
    const requests: PostmanItem[] = [];

    for (const api of collection.apis) {
      const request: PostmanItem = {
        name: api.name,
        description: api.description || '',
        request: this.createRequest(project, collection, api),
        response: [],
      };

      requests.push(request);
    }

    return requests;
  }

  /**
   * Create Postman request
   */
  private createRequest(project: any, collection: any, api: any): PostmanRequest {
    // Build full URL
    const baseUrl = project.localBaseUrl || project.productionBaseUrl || 'http://localhost:3000';
    const collectionPath = collection.basePath || '';
    const endpoint = api.endpoint || '';
    const fullUrl = this.buildUrl(baseUrl, collectionPath, endpoint);

    // Parse URL into Postman format
    const parsedUrl = this.parseUrlToPostman(fullUrl, api.queryParams || []);

    // Build headers
    const headers = this.buildHeaders(collection.headers || {}, api.headers || {});

    // Build body
    const body = this.buildBody(api.requestBody || []);

    const request: PostmanRequest = {
      method: api.method || 'GET',
      header: headers,
      url: parsedUrl,
      description: api.description || '',
    };

    // Add body if present
    if (body) {
      request.body = body;
    }

    return request;
  }

  /**
   * Build full URL from components
   */
  private buildUrl(baseUrl: string, collectionPath: string, endpoint: string): string {
    // Remove trailing slashes
    baseUrl = baseUrl.replace(/\/+$/, '');
    collectionPath = collectionPath.replace(/\/+$/, '');
    endpoint = endpoint.replace(/\/+$/, '');

    // Ensure leading slashes for paths
    if (collectionPath && !collectionPath.startsWith('/')) {
      collectionPath = '/' + collectionPath;
    }
    if (endpoint && !endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    // Build full URL
    let fullUrl = baseUrl;
    if (collectionPath) {
      fullUrl += collectionPath;
    }
    if (endpoint && endpoint !== '/') {
      fullUrl += endpoint;
    }

    return fullUrl;
  }

  /**
   * Parse URL into Postman URL format
   */
  private parseUrlToPostman(url: string, queryParams: any[]): PostmanUrl {
    try {
      const parsed = new URL(url);

      // Build query parameters
      const query: PostmanQueryParam[] = queryParams.map((param) => ({
        key: param.key,
        value: param.defaultValue || '',
        disabled: false,
        description: `Type: ${param.type}${param.required ? ' (required)' : ''}`,
      }));

      return {
        raw: url,
        protocol: parsed.protocol.replace(':', ''),
        host: parsed.hostname.split('.'),
        port: parsed.port || undefined,
        path: parsed.pathname.split('/').filter((s) => s),
        query: query.length > 0 ? query : undefined,
      };
    } catch (e) {
      // Fallback for invalid URLs
      return {
        raw: url,
        protocol: 'http',
        host: ['localhost'],
        path: url.split('/').filter((s) => s),
      };
    }
  }

  /**
   * Build headers array
   */
  private buildHeaders(
    collectionHeaders: Record<string, string>,
    apiHeaders: Record<string, string>,
  ): PostmanHeader[] {
    const headers: PostmanHeader[] = [];

    // Add collection headers
    for (const [key, value] of Object.entries(collectionHeaders)) {
      headers.push({
        key,
        value,
        type: 'text',
      });
    }

    // Add API headers (override collection headers)
    for (const [key, value] of Object.entries(apiHeaders)) {
      const existingIndex = headers.findIndex((h) => h.key === key);
      if (existingIndex >= 0) {
        headers[existingIndex].value = value;
      } else {
        headers.push({
          key,
          value,
          type: 'text',
        });
      }
    }

    return headers;
  }

  /**
   * Build request body
   */
  private buildBody(requestBody: any[]): PostmanBody | undefined {
    if (!requestBody || requestBody.length === 0) {
      return undefined;
    }

    // Build JSON object from fields
    const bodyObject: any = {};

    for (const field of requestBody) {
      // Handle nested fields (e.g., "user.name")
      const keys = field.key.split('.');
      let current = bodyObject;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      // Set value with appropriate type
      const lastKey = keys[keys.length - 1];
      current[lastKey] = this.getTypedValue(field.type, field.defaultValue);
    }

    return {
      mode: 'raw',
      raw: JSON.stringify(bodyObject, null, 2),
      options: {
        raw: {
          language: 'json',
        },
      },
    };
  }

  /**
   * Get typed value for body field
   */
  private getTypedValue(type: string, defaultValue: string): any {
    if (!defaultValue) {
      switch (type) {
        case 'string':
          return '';
        case 'number':
          return 0;
        case 'boolean':
          return false;
        case 'array':
          return [];
        case 'object':
          return {};
        default:
          return '';
      }
    }

    switch (type) {
      case 'number':
        return Number(defaultValue) || 0;
      case 'boolean':
        return defaultValue === 'true' || defaultValue === '1';
      case 'array':
        try {
          return JSON.parse(defaultValue);
        } catch {
          return [];
        }
      case 'object':
        try {
          return JSON.parse(defaultValue);
        } catch {
          return {};
        }
      default:
        return defaultValue;
    }
  }
}
