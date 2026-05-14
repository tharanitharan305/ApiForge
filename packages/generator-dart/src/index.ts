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
    
    console.log('[DartGenerator] Loading templates from:', templatesPath);
    
    const collectionTemplatePath = join(templatesPath, 'collection.hbs');
    console.log('[DartGenerator] Collection template path:', collectionTemplatePath);
    
    this.collectionTemplate = readFileSync(collectionTemplatePath, 'utf-8');
    console.log('[DartGenerator] Collection template loaded, length:', this.collectionTemplate.length);
    
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
    console.log('[DartGenerator] ========================================');
    console.log('[DartGenerator] Generating collection:', collection.name);
    console.log('[DartGenerator] Collection data:', JSON.stringify(collection, null, 2));
    console.log('[DartGenerator] Template length:', this.collectionTemplate.length);
    console.log('[DartGenerator] Template preview (first 300 chars):', this.collectionTemplate.substring(0, 300));
    
    const content = this.renderTemplate(this.collectionTemplate, {
      ...collection,
      project,
    });
    
    console.log('[DartGenerator] ========================================');
    console.log('[DartGenerator] GENERATED CONTENT (FULL):');
    console.log(content);
    console.log('[DartGenerator] ========================================');
    console.log('[DartGenerator] Content length:', content.length);
    console.log('[DartGenerator] Checking for corruption patterns...');
    
    // Check for corruption
    const hasBooleanLeakage = content.includes('truefalse') || content.match(/\b(true|false)\s*(true|false)/);
    const hasUnresolvedTemplates = content.match(/\{\{[^}]+\}\}/);
    const hasResponseVariable = content.includes('final response = await');
    const hasResponseUsage = content.includes('return ApiResponse');
    
    console.log('[DartGenerator] Corruption check results:');
    console.log('  - Boolean leakage:', hasBooleanLeakage ? 'YES - CORRUPTED!' : 'No');
    console.log('  - Unresolved templates:', hasUnresolvedTemplates ? 'YES - CORRUPTED!' : 'No');
    console.log('  - Has response variable:', hasResponseVariable ? 'Yes' : 'NO - MISSING!');
    console.log('  - Has response usage:', hasResponseUsage ? 'Yes' : 'No');
    
    if (hasBooleanLeakage) {
      console.error('[DartGenerator] ❌ CORRUPTION DETECTED: Boolean leakage found in generated content!');
      const matches = content.match(/\b(true|false)\s*(true|false)/g);
      console.error('[DartGenerator] Boolean leakage matches:', matches);
    }
    if (hasUnresolvedTemplates) {
      console.error('[DartGenerator] ❌ CORRUPTION DETECTED: Unresolved template variables found!');
      const matches = content.match(/\{\{[^}]+\}\}/g);
      console.error('[DartGenerator] Unresolved templates:', matches);
    }
    if (!hasResponseVariable && hasResponseUsage) {
      console.error('[DartGenerator] ❌ CORRUPTION DETECTED: Response variable used but not defined!');
    }
    
    const filename = `collections/${this.getCollectionFilename(collection.name)}`;
    console.log('[DartGenerator] Output filename:', filename);
    console.log('[DartGenerator] ========================================');

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
