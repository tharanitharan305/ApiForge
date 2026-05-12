import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { BaseGenerator } from '@apiforge/generator-core';
import { GeneratedFile } from '@apiforge/core';
import { toSnakeCase, toPascalCase } from '@apiforge/shared-utils';

// Find project root (where templates folder is)
const findProjectRoot = () => {
  let currentPath = __dirname;
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

export class DartGenerator extends BaseGenerator {
  language = 'dart';
  fileExtension = 'dart';

  private collectionTemplate: string;
  private modelsTemplate: string;
  private apiClientTemplate: string;
  private apiResponseTemplate: string;
  private indexTemplate: string;

  constructor() {
    super();
    const projectRoot = findProjectRoot();
    const templatesPath = join(projectRoot, 'templates/dart');
    
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

    // API Client
    const apiClientContent = this.renderTemplate(this.apiClientTemplate, { project });
    files.push({
      filename: 'core/api_client.dart',
      content: apiClientContent,
      language: this.language,
    });

    // API Response
    const apiResponseContent = this.renderTemplate(this.apiResponseTemplate, { project });
    files.push({
      filename: 'core/api_response.dart',
      content: apiResponseContent,
      language: this.language,
    });

    return files;
  }

  /**
   * Generate index file that exports all collections
   */
  async generateIndex(collections: any[]): Promise<GeneratedFile> {
    const exports = collections.map((c) => {
      const collectionFile = toSnakeCase(c.name);
      const modelsFile = `${toSnakeCase(c.name)}_models`;
      return {
        collectionFile,
        modelsFile,
        collectionClass: toPascalCase(c.name),
      };
    });

    const content = `// Generated SDK Index
// Export core
export 'core/api_client.dart';
export 'core/api_response.dart';

// Export collections
${exports.map((e) => `export 'collections/${e.collectionFile}.dart';`).join('\n')}

// Export models
${exports.map((e) => `export 'models/${e.modelsFile}.dart';`).join('\n')}
`;

    return {
      filename: 'index.dart',
      content,
      language: this.language,
    };
  }
}
