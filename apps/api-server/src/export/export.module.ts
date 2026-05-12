import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { GeneratorModule } from '../generator/generator.module';
import { ProjectModule } from '../project/project.module';
import { ApiModule } from '../api/api.module';

@Module({
  imports: [GeneratorModule, ProjectModule, ApiModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
