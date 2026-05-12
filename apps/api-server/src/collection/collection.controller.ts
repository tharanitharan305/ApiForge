import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';

@Controller('projects/:projectId/collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() createCollectionDto: CreateCollectionDto,
  ) {
    return this.collectionService.create(projectId, createCollectionDto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.collectionService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.collectionService.findOne(id, projectId);
  }

  @Patch(':id')
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionService.update(id, projectId, updateCollectionDto);
  }

  @Delete(':id')
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.collectionService.remove(id, projectId);
  }
}
