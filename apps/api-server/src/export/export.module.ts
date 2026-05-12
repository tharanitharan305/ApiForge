import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { GeneratorModule } from '../generator/generator.module';
import { ProjectModule } from '../project/project.module';
import { CollectionModule } from '../collection/collection.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [GeneratorModule, ProjectModule, CollectionModule, PrismaModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
