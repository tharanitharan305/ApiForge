import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratorService } from '../generator/generator.service';
import { ProjectService } from '../project/project.service';
import { CollectionService } from '../collection/collection.service';
import { createZipStream, ZipFile } from '@apiforge/shared-utils';
import { GeneratorValidator } from '@apiforge/generator-core';
import { PostmanParserService, ImportWarning } from './services/postman-parser.service';
import { PostmanExporterService } from './services/postman-exporter.service';
import { Readable } from 'stream';

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private generatorService: GeneratorService,
    private projectService: ProjectService,
    private collectionService: CollectionService,
    private postmanParser: PostmanParserService,
    private postmanExporter: PostmanExporterService,
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
      console.log(`[ExportService] ========================================`);
      console.log(`[ExportService] Generating SDK for language: ${language}`);
      console.log(`[ExportService] Project:`, project.name);
      console.log(`[ExportService] Collections count:`, collections.length);
      
      const files = await this.generatorService.generateForLanguage(
        language,
        project,
        collections,
      );

      console.log(`[ExportService] Generated ${files.length} files for ${language}`);
      console.log(`[ExportService] File list:`, files.map(f => f.filename));

      // Log first collection file content for debugging
      const collectionFile = files.find(f => f.filename.startsWith('collections/'));
      if (collectionFile) {
        console.log(`[ExportService] Sample collection file (${collectionFile.filename}):`);
        console.log(`[ExportService] Content preview (first 800 chars):`);
        console.log(collectionFile.content.substring(0, 800));
        console.log(`[ExportService] Content preview (last 300 chars):`);
        console.log(collectionFile.content.substring(collectionFile.content.length - 300));
      }

      // Validate generated files
      console.log(`[ExportService] Running validation for ${language}...`);
      const validation = GeneratorValidator.validate(files);
      const structureValidation = GeneratorValidator.validateCollectionStructure(files);

      console.log(`[ExportService] Validation result for ${language}:`, {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        stats: validation.stats,
      });
      console.log(`[ExportService] Structure validation result for ${language}:`, {
        valid: structureValidation.valid,
        errors: structureValidation.errors,
        warnings: structureValidation.warnings,
      });

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
        console.error(`[ExportService] ❌ Validation FAILED for ${language}. Blocking export.`);
        console.error(`[ExportService] All errors:`, allValidationErrors);
        console.error(`[ExportService] All warnings:`, allValidationWarnings);
        throw new BadRequestException({
          message: 'SDK generation validation failed',
          errors: allValidationErrors,
          warnings: allValidationWarnings,
          stats: validation.stats,
        });
      }

      console.log(`[ExportService] ✅ Validation PASSED for ${language}. Adding files to ZIP.`);

      files.forEach((file) => {
        zipFiles.push({
          path: `${language}/${file.filename}`,
          content: file.content,
        });
      });
      
      console.log(`[ExportService] ========================================`);
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

  /**
   * Import Postman Collection v2.1
   */
  async importPostmanCollection(postmanJson: any, userId: string): Promise<{
    projectId: string;
    project: any;
    collections: any[];
    stats: {
      collectionsCreated: number;
      apisCreated: number;
      warnings: ImportWarning[];
    };
    message: string;
    warnings: ImportWarning[];
  }> {
    // Parse Postman collection
    const parsed = this.postmanParser.parseCollection(postmanJson);

    // Create project
    const project = await this.prisma.project.create({
      data: {
        userId,
        name: parsed.projectName,
        description: parsed.projectDescription || '',
        localBaseUrl: parsed.baseUrl,
        productionBaseUrl: parsed.baseUrl,
      },
    });

    // Create collections and APIs
    const createdCollections = [];
    let totalApisCreated = 0;

    for (const collectionData of parsed.collections) {
      const collection = await this.prisma.collection.create({
        data: {
          projectId: project.id,
          name: collectionData.name,
          description: collectionData.description || '',
          basePath: collectionData.basePath,
          headers: collectionData.headers,
        },
      });

      // Create APIs
      for (const apiData of collectionData.apis) {
        await this.prisma.api.create({
          data: {
            collectionId: collection.id,
            name: apiData.name,
            description: apiData.description || '',
            endpoint: apiData.endpoint,
            method: apiData.method,
            headers: apiData.headers,
            queryParams: apiData.queryParams,
            requestBody: apiData.requestBody,
            authRequired: apiData.authRequired,
            timeout: 30000,
            overrideBaseUrl: null,
            responseMapping: null,
          },
        });
        totalApisCreated++;
      }

      createdCollections.push(collection);
    }

    return {
      projectId: project.id,
      project,
      collections: createdCollections,
      stats: {
        collectionsCreated: createdCollections.length,
        apisCreated: totalApisCreated,
        warnings: parsed.warnings || [],
      },
      message: `Postman collection imported successfully. Created ${createdCollections.length} collection(s) with ${totalApisCreated} API(s).`,
      warnings: parsed.warnings || [],
    };
  }

  /**
   * Export project as Postman Collection v2.1
   */
  async exportPostmanCollection(projectId: string) {
    const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
    const project = await this.projectService.findOne(projectId, MOCK_USER_ID);
    const collections = await this.collectionService.findAll(projectId);

    // Export to Postman format
    const postmanCollection = this.postmanExporter.exportToPostman(project, collections);

    return postmanCollection;
  }
}
