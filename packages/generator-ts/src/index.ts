import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { BaseGenerator } from '@apiforge/generator-core';
import { GeneratedFile } from '@apiforge/core';
import { toSnakeCase } from '@apiforge/shared-utils';

// Find project root (where templates folder is)
const findProjectRoot = () => {
  let currentPath = __dirname;
  // Go up until we find the templates folder
  for (let i = 0; i < 10; i++) {
    currentPath = resolve(currentPath, '..');
    try {
      const templatesPath = join(currentPath, 'templates');
      if (require('fs').existsSync(templatesPath)) {
        return currentPath;
      }
    } catch (e) {
      // Continue searching
    }
  }
  return process.cwd();
};

export class TypeScriptGenerator extends BaseGenerator {
  language = 'typescript';
  fileExtension = 'tsx'; // Changed from 'ts' to 'tsx'

  private collectionTemplate: string;
  private modelsTemplate: string;
  private apiClientTemplate: string;
  private apiResponseTemplate: string;
  private indexTemplate: string;

  constructor() {
    super();
    const projectRoot = findProjectRoot();
    const templatesPath = join(projectRoot, 'templates/typescript');
    
    this.collectionTemplate = readFileSync(
      join(templatesPath, 'collection.hbs'),
      'utf-8',
    );
    this.modelsTemplate = readFileSync(
      join(templatesPath, 'models.hbs'),
      'utf-8',
    );
    this.apiClientTemplate = readFileSync(
      join(templatesPath, 'api_client.hbs'),
      'utf-8',
    );
    this.apiResponseTemplate = readFileSync(
      join(templatesPath, 'api_response.hbs'),
      'utf-8',
    );
    this.indexTemplate = readFileSync(
      join(templatesPath, 'index.hbs'),
      'utf-8',
    );
  }

  /**
   * Generate a single collection file with all its APIs as methods
   */
  async generateCollection(collection: any, project: any): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.collectionTemplate, {
      ...collection,
      project,
    });
    
    const filename = `collections/${this.getCollectionFilename(collection.name)}`;

    return {
      filename,
      content,
      language: this.language,
    };
  }

  /**
   * Generate models file for a collection
   */
  async generateModels(collection: any, project: any): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.modelsTemplate, {
      ...collection,
      project,
    });
    
    const filename = `models/${this.getModelsFilename(collection.name)}`;

    return {
      filename,
      content,
      language: this.language,
    };
  }

  /**
   * Generate core/shared files (API client, response types, etc.)
   */
  async generateCore(project: any): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // API Client - use .ts for core files
    const apiClientContent = this.renderTemplate(this.apiClientTemplate, { project });
    files.push({
      filename: 'core/api_client.ts',
      content: apiClientContent,
      language: this.language,
    });

    // API Response - use .ts for core files
    const apiResponseContent = this.renderTemplate(this.apiResponseTemplate, { project });
    files.push({
      filename: 'core/api_response.ts',
      content: apiResponseContent,
      language: this.language,
    });

    return files;
  }

  /**
   * Generate index file that exports all collections
   */
  async generateIndex(collections: any[]): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.indexTemplate, { collections });

    // Index file uses .ts
    return {
      filename: 'index.ts',
      content,
      language: this.language,
    };
  }
}