import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectApiController } from './project-api.controller';
import { ProjectService } from './project.service';
import { CollectionModule } from '../collection/collection.module';
import { ApiModule } from '../api/api.module';

@Module({
  imports: [CollectionModule, ApiModule],
  controllers: [ProjectController, ProjectApiController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
