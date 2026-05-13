import { Module } from '@nestjs/common';
import { ExportController, ImportController } from './export.controller';
import { ExportService } from './export.service';
import { PostmanParserService } from './services/postman-parser.service';
import { PostmanExporterService } from './services/postman-exporter.service';
import { GeneratorModule } from '../generator/generator.module';
import { ProjectModule } from '../project/project.module';
import { CollectionModule } from '../collection/collection.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [GeneratorModule, ProjectModule, CollectionModule, PrismaModule],
  controllers: [ExportController, ImportController],
  providers: [ExportService, PostmanParserService, PostmanExporterService],
})
export class ExportModule {}
