import { readFileSync } from 'fs';
import { join } from 'path';
import { BaseGenerator } from '@apiforge/generator-core';
import { ApiDefinition, GeneratedFile } from '@apiforge/core';

export class JavaScriptGenerator extends BaseGenerator {
  language = 'javascript';
  fileExtension = 'js';

  private apiTemplate: string;
  private indexTemplate: string;

  constructor() {
    super();
    this.apiTemplate = readFileSync(
      join(__dirname, '../../../templates/javascript/api.hbs'),
      'utf-8',
    );
    this.indexTemplate = readFileSync(
      join(__dirname, '../../../templates/javascript/index.hbs'),
      'utf-8',
    );
  }

  async generateApi(api: ApiDefinition): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.apiTemplate, api);
    const filename = this.getFilename(api.name);

    return {
      filename,
      content,
      language: this.language,
    };
  }

  async generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile> {
    const content = this.renderTemplate(this.indexTemplate, { apis });

    return {
      filename: `index.${this.fileExtension}`,
      content,
      language: this.language,
    };
  }
}
