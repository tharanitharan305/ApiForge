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
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

// TODO: Add authentication and get real userId
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(MOCK_USER_ID, createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll(MOCK_USER_ID);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id, MOCK_USER_ID);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, MOCK_USER_ID, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id, MOCK_USER_ID);
  }
}
