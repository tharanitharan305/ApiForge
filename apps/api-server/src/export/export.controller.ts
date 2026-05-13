import {
  Controller,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { ExportDto, ImportDto } from './dto';
import { ImportWarning } from './services/postman-parser.service';

@Controller('projects/:projectId/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('generate')
  async generate(
    @Param('projectId') projectId: string,
    @Body() exportDto: ExportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const zipStream = await this.exportService.generateZip(
      projectId,
      exportDto.languages,
    );

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="apiforge-sdk.zip"`,
    });

    return new StreamableFile(zipStream);
  }

  @Post('config')
  async exportConfig(@Param('projectId') projectId: string) {
    return this.exportService.exportConfig(projectId);
  }

  @Post('import')
  async importConfig(
    @Param('projectId') projectId: string,
    @Body() importDto: ImportDto,
  ) {
    return this.exportService.importConfig(projectId, importDto.config);
  }

  @Post('postman')
  async exportPostman(@Param('projectId') projectId: string) {
    return this.exportService.exportPostmanCollection(projectId);
  }
}

@Controller('import')
export class ImportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('postman')
  async importPostman(@Body() body: { collection: any }): Promise<{
    projectId: string;
    project: any;
    collections: any[];
    stats: {
      collectionsCreated: number;
      apisCreated: number;
      warnings: ImportWarning[];
    };
    message: string;
    warnings: ImportWarning[];
  }> {
    try {
      console.log('Received import request');
      console.log('Body type:', typeof body);
      console.log('Body keys:', Object.keys(body || {}));
      console.log('Collection type:', typeof body?.collection);
      
      if (typeof body?.collection === 'string') {
        console.log('Collection is a string, parsing...');
        body.collection = JSON.parse(body.collection);
      }
      
      const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
      return this.exportService.importPostmanCollection(body.collection, MOCK_USER_ID);
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }
}
