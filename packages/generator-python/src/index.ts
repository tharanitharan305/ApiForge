import { readFileSync } from 'fs';
import { join } from 'path';
import { BaseGenerator } from '@apiforge/generator-core';
import { ApiDefinition, GeneratedFile } from '@apiforge/core';
import { toSnakeCase } from '@apiforge/shared-utils';

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
    
    this.apiTemplate = readFileSync(
      join(__dirname, '../../../templates/python/api.hbs'),
      'utf-8',
    );
    this.indexTemplate = readFileSync(
      join(__dirname, '../../../templates/python/index.hbs'),
      'utf-8',
    );
  }

  async generateApi(api: ApiDefinition): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.apiTemplate, api);
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
