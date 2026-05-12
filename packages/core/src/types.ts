/**
 * Core types for ApiForge platform
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface QueryParam {
  key: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface RequestField {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface ResponseMapping {
  successPath: string;
  messagePath: string;
  dataPath: string;
  statusCodePath?: string;
}

export interface ApiDefinition {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  overrideBaseUrl?: string;
  endpoint: string;
  method: HttpMethod;
  headers: Record<string, string>;
  queryParams: QueryParam[];
  requestBody: RequestField[];
  responseMapping: ResponseMapping;
  timeout?: number;
  authRequired?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  localBaseUrl: string;
  productionBaseUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  raw: any;
}

export interface ExportConfig {
  project: Project;
  apis: ApiDefinition[];
  exportedAt: Date;
  version: string;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  language: string;
}

export interface ExportResult {
  files: GeneratedFile[];
  config: ExportConfig;
}
