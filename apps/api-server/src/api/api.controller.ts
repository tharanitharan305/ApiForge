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
import { ApiService } from './api.service';
import { CreateApiDto, UpdateApiDto } from './dto';

@Controller('collections/:collectionId/apis')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('collectionId') collectionId: string,
    @Body() createApiDto: CreateApiDto,
  ) {
    return this.apiService.create(collectionId, createApiDto);
  }

  @Get()
  findAll(@Param('collectionId') collectionId: string) {
    return this.apiService.findAll(collectionId);
  }

  @Get(':id')
  findOne(
    @Param('collectionId') collectionId: string,
    @Param('id') id: string,
  ) {
    return this.apiService.findOne(id, collectionId);
  }

  @Patch(':id')
  update(
    @Param('collectionId') collectionId: string,
    @Param('id') id: string,
    @Body() updateApiDto: UpdateApiDto,
  ) {
    return this.apiService.update(id, collectionId, updateApiDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('collectionId') collectionId: string,
    @Param('id') id: string,
  ) {
    return this.apiService.remove(id, collectionId);
  }
}
