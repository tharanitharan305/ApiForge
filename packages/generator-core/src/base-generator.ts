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
    // Register with both camelCase and snake_case naming for flexibility
    this.handlebars.registerHelper('camelCase', helpers.toCamelCase);
    this.handlebars.registerHelper('pascalCase', helpers.toPascalCase);
    this.handlebars.registerHelper('snakeCase', helpers.toSnakeCase);
    this.handlebars.registerHelper('snake_case', helpers.toSnakeCase); // Alias
    this.handlebars.registerHelper('kebabCase', helpers.toKebabCase);
    this.handlebars.registerHelper('kebab_case', helpers.toKebabCase); // Alias
    this.handlebars.registerHelper('capitalize', helpers.capitalize);
    this.handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());
    this.handlebars.registerHelper('lowercase', (str: string) => str.toLowerCase());
    
    // Comparison helpers - must return content in block form
    this.handlebars.registerHelper('eq', function(this: any, a: any, b: any, options: any) {
      if (arguments.length === 3) {
        // Inline form: {{eq a b}}
        return a === b;
      }
      // Block form: {{#eq a b}}content{{/eq}}
      return a === b ? options.fn(this) : options.inverse(this);
    });
    
    this.handlebars.registerHelper('or', (a: any, b: any) => a || b);
    this.handlebars.registerHelper('and', (a: any, b: any) => a && b);
    
    // Type mapping helper for cleaner templates
    this.handlebars.registerHelper('tsType', (type: string) => {
      const typeMap: Record<string, string> = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        object: 'Record<string, any>',
        array: 'any[]',
      };
      return typeMap[type] || 'any';
    });
    
    this.handlebars.registerHelper('dartType', (type: string) => {
      const typeMap: Record<string, string> = {
        string: 'String',
        number: 'num',
        boolean: 'bool',
        object: 'Map<String, dynamic>',
        array: 'List<dynamic>',
      };
      return typeMap[type] || 'dynamic';
    });
    
    this.handlebars.registerHelper('pythonType', (type: string) => {
      const typeMap: Record<string, string> = {
        string: 'str',
        number: 'float',
        boolean: 'bool',
        object: 'Dict[str, Any]',
        array: 'list',
      };
      return typeMap[type] || 'Any';
    });
    
    // Add hasRequired helper for checking if any field is required
    this.handlebars.registerHelper('hasRequired', (fields: any[]) => {
      return fields && fields.some((field: any) => field.required);
    });
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
  abstract generateApi(api: ApiDefinition, project: any): Promise<GeneratedFile>;

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
