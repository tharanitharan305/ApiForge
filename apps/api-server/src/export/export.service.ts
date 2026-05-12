import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratorService } from '../generator/generator.service';
import { ProjectService } from '../project/project.service';
import { CollectionService } from '../collection/collection.service';
import { createZipStream, ZipFile } from '@apiforge/shared-utils';
import { GeneratorValidator } from '@apiforge/generator-core';
import { Readable } from 'stream';

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private generatorService: GeneratorService,
    private projectService: ProjectService,
    private collectionService: CollectionService,
  ) {}

  async generateZip(
    projectId: string,
    languages: string[],
  ): Promise<Readable> {
    // Get project and collections (using mock user ID for v1)
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
    const project = await this.projectService.findOne(projectId, MOCK_USER_ID);
    const collections = await this.collectionService.findAll(projectId);

    const zipFiles: ZipFile[] = [];
    const allValidationErrors: string[] = [];
    const allValidationWarnings: string[] = [];

    // Generate code for each language
    for (const language of languages) {
      const files = await this.generatorService.generateForLanguage(
        language,
        project,
        collections,
      );

      // Validate generated files
      const validation = GeneratorValidator.validate(files);
      const structureValidation = GeneratorValidator.validateCollectionStructure(files);

      // Collect errors and warnings
      if (!validation.valid) {
        allValidationErrors.push(`[${language}] ${validation.errors.join(', ')}`);
      }
      if (!structureValidation.valid) {
        allValidationErrors.push(`[${language}] ${structureValidation.errors.join(', ')}`);
      }
      
      allValidationWarnings.push(...validation.warnings.map(w => `[${language}] ${w}`));
      allValidationWarnings.push(...structureValidation.warnings.map(w => `[${language}] ${w}`));

      // If validation failed, throw error with details
      if (!validation.valid || !structureValidation.valid) {
        throw new BadRequestException({
          message: 'SDK generation validation failed',
          errors: allValidationErrors,
          warnings: allValidationWarnings,
          stats: validation.stats,
        });
      }

      files.forEach((file) => {
        zipFiles.push({
          path: `${language}/${file.filename}`,
          content: file.content,
        });
      });
    }

    // Add config.json
    const config = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        localBaseUrl: project.localBaseUrl,
        productionBaseUrl: project.productionBaseUrl,
      },
      collections: collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        basePath: collection.basePath,
        headers: collection.headers,
        apis: collection.apis.map((api) => ({
          id: api.id,
          name: api.name,
          description: api.description,
          overrideBaseUrl: api.overrideBaseUrl,
          endpoint: api.endpoint,
          method: api.method,
          headers: api.headers,
          queryParams: api.queryParams,
          requestBody: api.requestBody,
          responseMapping: api.responseMapping,
          timeout: api.timeout,
          authRequired: api.authRequired,
        })),
      })),
      exportedAt: new Date().toISOString(),
      version: '2.0.0', // Version 2 with collections
    };

    zipFiles.push({
      path: 'config.json',
      content: JSON.stringify(config, null, 2),
    });

    // Save export history
    await this.prisma.export.create({
      data: {
        projectId,
        config,
        languages,
      },
    });

    return createZipStream(zipFiles);
  }

  async exportConfig(projectId: string) {
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
    const project = await this.projectService.findOne(projectId, MOCK_USER_ID);
    const collections = await this.collectionService.findAll(projectId);

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        localBaseUrl: project.localBaseUrl,
        productionBaseUrl: project.productionBaseUrl,
      },
      collections: collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        basePath: collection.basePath,
        headers: collection.headers,
        apis: collection.apis.map((api) => ({
          id: api.id,
          name: api.name,
          description: api.description,
          overrideBaseUrl: api.overrideBaseUrl,
          endpoint: api.endpoint,
          method: api.method,
          headers: api.headers,
          queryParams: api.queryParams,
          requestBody: api.requestBody,
          responseMapping: api.responseMapping,
          timeout: api.timeout,
          authRequired: api.authRequired,
        })),
      })),
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
  }

  async importConfig(projectId: string, config: any) {
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
    // Validate project exists
    await this.projectService.findOne(projectId, MOCK_USER_ID);

    // Delete existing collections (cascade will delete APIs)
    await this.prisma.collection.deleteMany({
      where: { projectId },
    });

    // Import collections and APIs
    const importedCollections = [];
    for (const collectionConfig of config.collections || []) {
      const collection = await this.prisma.collection.create({
        data: {
          projectId,
          name: collectionConfig.name,
          description: collectionConfig.description,
          basePath: collectionConfig.basePath,
          headers: collectionConfig.headers || {},
        },
      });

      // Import APIs for this collection
      for (const apiConfig of collectionConfig.apis || []) {
        await this.prisma.api.create({
          data: {
            collectionId: collection.id,
            name: apiConfig.name,
            description: apiConfig.description,
            overrideBaseUrl: apiConfig.overrideBaseUrl,
            endpoint: apiConfig.endpoint,
            method: apiConfig.method,
            headers: apiConfig.headers || {},
            queryParams: apiConfig.queryParams || [],
            requestBody: apiConfig.requestBody || [],
            responseMapping: apiConfig.responseMapping,
            timeout: apiConfig.timeout || 30000,
            authRequired: apiConfig.authRequired || false,
          },
        });
      }

      importedCollections.push(collection);
    }

    return {
      message: 'Config imported successfully',
      imported: importedCollections.length,
    };
  }
}
