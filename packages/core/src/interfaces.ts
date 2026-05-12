/**
 * Core interfaces for generator plugins
 */

import { ApiDefinition, GeneratedFile, Project } from './types';

export interface GeneratorPlugin {
  language: string;
  fileExtension: string;
  generateApi(api: ApiDefinition, project: Project): Promise<GeneratedFile>;
  generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile>;
}

export interface GeneratorOptions {
  includeComments?: boolean;
  includeErrorHandling?: boolean;
  normalizeResponses?: boolean;
}

export interface TemplateContext {
  api: ApiDefinition;
  project: Project;
  options: GeneratorOptions;
  helpers: Record<string, any>;
}
