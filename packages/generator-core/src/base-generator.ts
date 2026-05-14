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
    
    // Comparison helpers - BLOCK FORM for conditionals
    this.handlebars.registerHelper('eq', function(this: any, a: any, b: any, options: any) {
      console.log('[Handlebars eq] Called with:', { a, b, hasOptions: !!options, hasFn: !!(options && options.fn) });
      // Block helper form: {{#eq a b}}...{{/eq}}
      if (options && options.fn) {
        const result = a === b;
        console.log('[Handlebars eq] Block form, comparison result:', result);
        return result ? options.fn(this) : options.inverse(this);
      }
      // Inline form: {{eq a b}} - should NOT be used in templates
      console.log('[Handlebars eq] WARNING: Inline form used (returns boolean)');
      return a === b;
    });
    
    this.handlebars.registerHelper('or', function(this: any, a: any, b: any, options: any) {
      console.log('[Handlebars or] Called with:', { a, b, hasOptions: !!options, hasFn: !!(options && options.fn) });
      if (options && options.fn) {
        const result = a || b;
        console.log('[Handlebars or] Block form, result:', result);
        return result ? options.fn(this) : options.inverse(this);
      }
      console.log('[Handlebars or] WARNING: Inline form used (returns boolean)');
      return a || b;
    });
    
    this.handlebars.registerHelper('and', function(this: any, a: any, b: any, options: any) {
      console.log('[Handlebars and] Called with:', { a, b, hasOptions: !!options, hasFn: !!(options && options.fn) });
      if (options && options.fn) {
        const result = a && b;
        console.log('[Handlebars and] Block form, result:', result);
        return result ? options.fn(this) : options.inverse(this);
      }
      console.log('[Handlebars and] WARNING: Inline form used (returns boolean)');
      return a && b;
    });
    
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
   * Generate a single collection file with all its APIs as methods
   */
  abstract generateCollection(collection: any, project: any): Promise<GeneratedFile>;

  /**
   * Generate models file for a collection
   */
  abstract generateModels(collection: any, project: any): Promise<GeneratedFile>;

  /**
   * Generate core/shared files (API client, response types, etc.)
   */
  abstract generateCore(project: any): Promise<GeneratedFile[]>;

  /**
   * Generate index file that exports all collections
   */
  abstract generateIndex(collections: any[]): Promise<GeneratedFile>;

  /**
   * Get filename for a collection
   */
  protected getCollectionFilename(collectionName: string): string {
    return `${helpers.toSnakeCase(collectionName)}.${this.fileExtension}`;
  }

  /**
   * Get filename for models
   */
  protected getModelsFilename(collectionName: string): string {
    return `${helpers.toSnakeCase(collectionName)}_models.${this.fileExtension}`;
  }
}
