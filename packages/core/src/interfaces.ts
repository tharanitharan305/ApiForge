/**
 * Core interfaces for generator plugins
 */

import { ApiDefinition, GeneratedFile, Project } from './types';

export interface GeneratorPlugin {
  language: string;
  fileExtension: string;
  
  /**
   * Generate a collection service file with all APIs as methods
   * @deprecated Use generateCollection instead
   */
  generateApi?(api: ApiDefinition, project: Project, collection: any): Promise<GeneratedFile>;
  
  /**
   * Generate a single collection file with all its APIs as methods
   */
  generateCollection(collection: any, project: Project): Promise<GeneratedFile>;
  
  /**
   * Generate models file for a collection
   */
  generateModels(collection: any, project: Project): Promise<GeneratedFile>;
  
  /**
   * Generate core/shared files (API client, response types, etc.)
   */
  generateCore(project: Project): Promise<GeneratedFile[]>;
  
  /**
   * Generate index file that exports all collections
   */
  generateIndex(collections: any[]): Promise<GeneratedFile>;
}

export interface GeneratorOptions {
  includeComments?: boolean;
  includeErrorHandling?: boolean;
  normalizeResponses?: boolean;
}

export interface TemplateContext {
  api: ApiDefinition;
  project: Project;
  collection: any;
  options: GeneratorOptions;
  helpers: Record<string, any>;
}
