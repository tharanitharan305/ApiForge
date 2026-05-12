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

@Controller('projects/:projectId/apis')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('projectId') projectId: string,
    @Body() createApiDto: CreateApiDto,
  ) {
    return this.apiService.create(projectId, createApiDto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.apiService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.apiService.findOne(id, projectId);
  }

  @Patch(':id')
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateApiDto: UpdateApiDto,
  ) {
    return this.apiService.update(id, projectId, updateApiDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.apiService.remove(id, projectId);
  }
}
