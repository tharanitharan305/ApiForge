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
}
