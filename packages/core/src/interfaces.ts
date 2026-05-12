/**
 * Core interfaces for generator plugins
 */

import { ApiDefinition, GeneratedFile } from './types';

export interface GeneratorPlugin {
  language: string;
  fileExtension: string;
  generateApi(api: ApiDefinition): Promise<GeneratedFile>;
  generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile>;
}

export interface GeneratorOptions {
  includeComments?: boolean;
  includeErrorHandling?: boolean;
  normalizeResponses?: boolean;
}

export interface TemplateContext {
  api: ApiDefinition;
  options: GeneratorOptions;
  helpers: Record<string, any>;
}
