import { GeneratorPlugin } from '@apiforge/core';

/**
 * Registry for managing generator plugins
 */
export class GeneratorRegistry {
  private generators: Map<string, GeneratorPlugin> = new Map();

  /**
   * Register a generator plugin
   */
  register(generator: GeneratorPlugin): void {
    this.generators.set(generator.language, generator);
  }

  /**
   * Get a generator by language
   */
  get(language: string): GeneratorPlugin | undefined {
    return this.generators.get(language);
  }

  /**
   * Get all registered generators
   */
  getAll(): GeneratorPlugin[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Check if a language is supported
   */
  isSupported(language: string): boolean {
    return this.generators.has(language);
  }
}

// Global registry instance
export const generatorRegistry = new GeneratorRegistry();
