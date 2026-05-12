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
    project: any,
    collections: any[],
  ): Promise<GeneratedFile[]> {
    const generator = generatorRegistry.get(language);
    
    if (!generator) {
      throw new Error(`Generator for language "${language}" not found`);
    }

    const files: GeneratedFile[] = [];

    // Generate ONE file per collection (with all APIs as methods)
    for (const collection of collections) {
      // Generate collection service file
      const collectionFile = await generator.generateCollection(collection, project);
      files.push(collectionFile);

      // Generate models file for this collection
      const modelsFile = await generator.generateModels(collection, project);
      files.push(modelsFile);
    }

    // Generate core files (API client, response types, etc.)
    const coreFiles = await generator.generateCore(project);
    files.push(...coreFiles);

    // Generate index file
    const indexFile = await generator.generateIndex(collections);
    files.push(indexFile);

    return files;
  }

  async generateForAllLanguages(
    project: any,
    collections: any[],
  ): Promise<Record<string, GeneratedFile[]>> {
    const languages = generatorRegistry.getSupportedLanguages();
    const result: Record<string, GeneratedFile[]> = {};

    for (const language of languages) {
      result[language] = await this.generateForLanguage(language, project, collections);
    }

    return result;
  }

  getSupportedLanguages(): string[] {
    return generatorRegistry.getSupportedLanguages();
  }
}
