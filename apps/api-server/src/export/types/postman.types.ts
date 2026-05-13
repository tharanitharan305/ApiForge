/**
 * Postman Collection v2.1 Type Definitions
 * Based on: https://schema.postman.com/json/collection/v2.1.0/collection.json
 */

export interface PostmanCollection {
  info: PostmanInfo;
  item: PostmanItem[];
  auth?: PostmanAuth;
  variable?: PostmanVariable[];
}

export interface PostmanInfo {
  name: string;
  description?: string;
  version?: string;
  schema: string;
  _postman_id?: string;
}

export interface PostmanItem {
  name: string;
  description?: string;
  item?: PostmanItem[]; // Nested folders
  request?: PostmanRequest;
  response?: any[];
}

export interface PostmanRequest {
  method: string;
  header?: PostmanHeader[];
  body?: PostmanBody;
  url: PostmanUrl | string;
  auth?: PostmanAuth;
  description?: string;
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  port?: string;
  path?: string[];
  query?: PostmanQueryParam[];
  variable?: PostmanVariable[];
}

export interface PostmanHeader {
  key: string;
  value: string;
  type?: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanQueryParam {
  key: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanBody {
  mode: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
  raw?: string;
  options?: {
    raw?: {
      language?: string;
    };
  };
  urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>;
  formdata?: Array<{ key: string; value: string; type?: string; disabled?: boolean }>;
}

export interface PostmanAuth {
  type: string;
  bearer?: Array<{ key: string; value: string; type: string }>;
  basic?: Array<{ key: string; value: string; type: string }>;
  apikey?: Array<{ key: string; value: string; type: string }>;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
  disabled?: boolean;
}

/**
 * Internal parsed structure for import
 */
export interface ParsedPostmanCollection {
  projectName: string;
  projectDescription?: string;
  baseUrl: string;
  collections: ParsedCollection[];
  globalHeaders: Record<string, string>;
  globalAuth?: PostmanAuth;
}

export interface ParsedCollection {
  name: string;
  description?: string;
  basePath: string;
  headers: Record<string, string>;
  apis: ParsedApi[];
}

export interface ParsedApi {
  name: string;
  description?: string;
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  queryParams: Array<{ key: string; type: string; required: boolean; defaultValue: string }>;
  requestBody: Array<{ key: string; type: string; required: boolean; defaultValue: string }>;
  authRequired: boolean;
}
