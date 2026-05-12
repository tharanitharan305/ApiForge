import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiService } from '../api/api.service';
import { CollectionService } from '../collection/collection.service';
import { CreateApiDto, UpdateApiDto } from '../api/dto';

/**
 * Backward-compatible project-level API endpoints
 * Automatically creates/uses a default collection for the project
 */
@Controller('projects/:projectId/apis')
export class ProjectApiController {
  constructor(
    private readonly apiService: ApiService,
    private readonly collectionService: CollectionService,
  ) {}

  /**
   * Get or create the default collection for a project
   */
  private async getOrCreateDefaultCollection(projectId: string) {
    const collections = await this.collectionService.findAll(projectId);
    
    // Find existing default collection
    let defaultCollection = collections.find(
      (c) => c.name === 'Default' || c.basePath === '/',
    );

    // Create default collection if it doesn't exist
    if (!defaultCollection) {
      const created = await this.collectionService.create(projectId, {
        name: 'Default',
        description: 'Default collection for APIs',
        basePath: '/',
        headers: {},
      });
      
      // Fetch it again to get the same structure as findAll
      const allCollections = await this.collectionService.findAll(projectId);
      defaultCollection = allCollections.find((c) => c.id === created.id);
    }

    return defaultCollection!;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Body() createApiDto: CreateApiDto,
  ) {
    const collection = await this.getOrCreateDefaultCollection(projectId);
    return this.apiService.create(collection.id, createApiDto);
  }

  @Get()
  async findAll(@Param('projectId') projectId: string) {
    const collections = await this.collectionService.findAll(projectId);
    // Return all APIs from all collections
    return collections.flatMap((c) => c.apis || []);
  }

  @Get(':id')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const collections = await this.collectionService.findAll(projectId);
    
    // Find the API in any collection
    for (const collection of collections) {
      const api = collection.apis?.find((a) => a.id === id);
      if (api) {
        return api;
      }
    }

    // If not found, try direct lookup (will throw NotFoundException if not found)
    const collection = await this.getOrCreateDefaultCollection(projectId);
    return this.apiService.findOne(id, collection.id);
  }

  @Patch(':id')
  async update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateApiDto: UpdateApiDto,
  ) {
    const collections = await this.collectionService.findAll(projectId);
    
    // Find which collection contains this API
    for (const collection of collections) {
      const api = collection.apis?.find((a) => a.id === id);
      if (api) {
        return this.apiService.update(id, collection.id, updateApiDto);
      }
    }

    // If not found, use default collection
    const collection = await this.getOrCreateDefaultCollection(projectId);
    return this.apiService.update(id, collection.id, updateApiDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const collections = await this.collectionService.findAll(projectId);
    
    // Find which collection contains this API
    for (const collection of collections) {
      const api = collection.apis?.find((a) => a.id === id);
      if (api) {
        return this.apiService.remove(id, collection.id);
      }
    }

    // If not found, use default collection
    const collection = await this.getOrCreateDefaultCollection(projectId);
    return this.apiService.remove(id, collection.id);
  }
}
