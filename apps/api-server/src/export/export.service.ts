import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratorService } from '../generator/generator.service';
import { ProjectService } from '../project/project.service';
import { ApiService } from '../api/api.service';
import { createZipStream, ZipFile } from '@apiforge/shared-utils';
import { Readable } from 'stream';

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private generatorService: GeneratorService,
    private projectService: ProjectService,
    private apiService: ApiService,
  ) {}

  async generateZip(
    projectId: string,
    languages: string[],
  ): Promise<Readable> {
    // Get project and APIs
    const project = await this.projectService.findOne(projectId, 'mock-user');
    const apis = await this.apiService.findAll(projectId);

    // Transform Prisma models to ApiDefinition format
    const apiDefinitions = apis.map((api) => ({
      id: api.id,
      projectId: api.projectId,
      name: api.name,
      description: api.description || undefined,
      environments: {
        local: api.localUrl,
        production: api.productionUrl,
      },
      endpoint: api.endpoint,
      method: api.method as any,
      headers: api.headers as Record<string, string>,
      queryParams: api.queryParams as any[],
      requestBody: api.requestBody as any[],
      responseMapping: api.responseMapping as any,
      timeout: api.timeout,
      authRequired: api.authRequired,
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
    }));

    const zipFiles: ZipFile[] = [];

    // Generate code for each language
    for (const language of languages) {
      const files = await this.generatorService.generateForLanguage(
        language,
        apiDefinitions,
      );

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
      },
      apis: apiDefinitions,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
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
    const project = await this.projectService.findOne(projectId, 'mock-user');
    const apis = await this.apiService.findAll(projectId);

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
      },
      apis: apis.map((api) => ({
        id: api.id,
        name: api.name,
        description: api.description,
        environments: {
          local: api.localUrl,
          production: api.productionUrl,
        },
        endpoint: api.endpoint,
        method: api.method,
        headers: api.headers,
        queryParams: api.queryParams,
        requestBody: api.requestBody,
        responseMapping: api.responseMapping,
        timeout: api.timeout,
        authRequired: api.authRequired,
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  async importConfig(projectId: string, config: any) {
    // Validate project exists
    await this.projectService.findOne(projectId, 'mock-user');

    // Delete existing APIs
    await this.prisma.api.deleteMany({
      where: { projectId },
    });

    // Import APIs
    const importedApis = [];
    for (const apiConfig of config.apis) {
      const api = await this.prisma.api.create({
        data: {
          projectId,
          name: apiConfig.name,
          description: apiConfig.description,
          localUrl: apiConfig.environments.local,
          productionUrl: apiConfig.environments.production,
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
      importedApis.push(api);
    }

    return {
      message: 'Config imported successfully',
      imported: importedApis.length,
    };
  }
}
