import { Injectable, OnModuleInit } from '@nestjs/common';
import { generatorRegistry } from '@apiforge/generator-core';
import { DartGenerator } from '@apiforge/generator-dart';
import { TypeScriptGenerator } from '@apiforge/generator-ts';
import { JavaScriptGenerator } from '@apiforge/generator-js';
import { PythonGenerator } from '@apiforge/generator-python';
import { ApiDefinition, GeneratedFile } from '@apiforge/core';

@Injectable()
export class GeneratorService implements OnModuleInit {
  onModuleInit() {
    // Register all generators
    generatorRegistry.register(new DartGenerator());
    generatorRegistry.register(new TypeScriptGenerator());
    generatorRegistry.register(new JavaScriptGenerator());
    generatorRegistry.register(new PythonGenerator());
  }

  async generateForLanguage(
    language: string,
    apis: ApiDefinition[],
  ): Promise<GeneratedFile[]> {
    const generator = generatorRegistry.get(language);
    
    if (!generator) {
      throw new Error(`Generator for language "${language}" not found`);
    }

    const files: GeneratedFile[] = [];

    // Generate individual API files
    for (const api of apis) {
      const file = await generator.generateApi(api);
      files.push(file);
    }

    // Generate index file
    const indexFile = await generator.generateIndex(apis);
    files.push(indexFile);

    return files;
  }

  async generateForAllLanguages(
    apis: ApiDefinition[],
  ): Promise<Record<string, GeneratedFile[]>> {
    const languages = generatorRegistry.getSupportedLanguages();
    const result: Record<string, GeneratedFile[]> = {};

    for (const language of languages) {
      result[language] = await this.generateForLanguage(language, apis);
    }

    return result;
  }

  getSupportedLanguages(): string[] {
    return generatorRegistry.getSupportedLanguages();
  }
}
