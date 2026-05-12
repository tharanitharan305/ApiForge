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

export class DartGenerator extends BaseGenerator {
  language = 'dart';
  fileExtension = 'dart';

  private apiTemplate: string;
  private indexTemplate: string;

  constructor() {
    super();
    const projectRoot = findProjectRoot();
    const templatesPath = join(projectRoot, 'templates/dart');
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
      filename: `index.${this.fileExtension}`,
      content,
      language: this.language,
    };
  }
}
