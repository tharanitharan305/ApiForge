import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { BaseGenerator } from '@apiforge/generator-core';
import { ApiDefinition, GeneratedFile } from '@apiforge/core';
import { toSnakeCase } from '@apiforge/shared-utils';

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

export class PythonGenerator extends BaseGenerator {
  language = 'python';
  fileExtension = 'py';

  private apiTemplate: string;
  private indexTemplate: string;

  constructor() {
    super();
    
    // Register additional helpers for Python
    this.handlebars.registerHelper('snake_case', toSnakeCase);
    this.handlebars.registerHelper('hasRequired', (fields: any[]) => {
      return fields.some((f) => f.required);
    });
    
    const projectRoot = findProjectRoot();
    const templatesPath = join(projectRoot, 'templates/python');
    this.apiTemplate = readFileSync(
      join(templatesPath, 'api.hbs'),
      'utf-8',
    );
    this.indexTemplate = readFileSync(
      join(templatesPath, 'index.hbs'),
      'utf-8',
    );
  }

  async generateApi(api: ApiDefinition, project: any): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.apiTemplate, { ...api, project });
    const filename = `${toSnakeCase(api.name)}_api.${this.fileExtension}`;

    return {
      filename,
      content,
      language: this.language,
    };
  }

  async generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.indexTemplate, { apis });

    return {
      filename: `__init__.${this.fileExtension}`,
      content,
      language: this.language,
    };
  }
}
