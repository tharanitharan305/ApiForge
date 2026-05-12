import Handlebars from 'handlebars';
import { GeneratorPlugin, ApiDefinition, GeneratedFile } from '@apiforge/core';
import * as helpers from '@apiforge/shared-utils';

/**
 * Base class for all language generators
 * Provides common functionality and template rendering
 */
export abstract class BaseGenerator implements GeneratorPlugin {
  abstract language: string;
  abstract fileExtension: string;

  protected handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers for template rendering
   */
  protected registerHelpers(): void {
    this.handlebars.registerHelper('camelCase', helpers.toCamelCase);
    this.handlebars.registerHelper('pascalCase', helpers.toPascalCase);
    this.handlebars.registerHelper('snakeCase', helpers.toSnakeCase);
    this.handlebars.registerHelper('kebabCase', helpers.toKebabCase);
    this.handlebars.registerHelper('capitalize', helpers.capitalize);
    this.handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());
    this.handlebars.registerHelper('lowercase', (str: string) => str.toLowerCase());
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('or', (a: any, b: any) => a || b);
    this.handlebars.registerHelper('and', (a: any, b: any) => a && b);
  }

  /**
   * Compile and render a template with context
   */
  protected renderTemplate(template: string, context: any): string {
    const compiled = this.handlebars.compile(template);
    return compiled(context);
  }

  /**
   * Generate API service file
   */
  abstract generateApi(api: ApiDefinition): Promise<GeneratedFile>;

  /**
   * Generate index file that exports all APIs
   */
  abstract generateIndex(apis: ApiDefinition[]): Promise<GeneratedFile>;

  /**
   * Get filename for an API
   */
  protected getFilename(apiName: string): string {
    return `${helpers.toKebabCase(apiName)}.${this.fileExtension}`;
  }
}
