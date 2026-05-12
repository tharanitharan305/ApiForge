import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { ApiModule } from './api/api.module';
import { GeneratorModule } from './generator/generator.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProjectModule,
    ApiModule,
    GeneratorModule,
    ExportModule,
  ],
})
export class AppModule {}
