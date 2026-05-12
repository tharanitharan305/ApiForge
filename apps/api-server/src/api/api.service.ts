import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiDto, UpdateApiDto } from './dto';

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateApiDto) {
    return this.prisma.api.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        overrideBaseUrl: dto.overrideBaseUrl,
        endpoint: dto.endpoint,
        method: dto.method,
        headers: dto.headers || {},
        queryParams: (dto.queryParams || []) as any,
        requestBody: (dto.requestBody || []) as any,
        responseMapping: dto.responseMapping as any,
        timeout: dto.timeout || 30000,
        authRequired: dto.authRequired || false,
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.api.findMany({
      where: { projectId },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, projectId: string) {
    const api = await this.prisma.api.findFirst({
      where: { id, projectId },
    });

    if (!api) {
      throw new NotFoundException('API not found');
    }

    return api;
  }

  async update(id: string, projectId: string, dto: UpdateApiDto) {
    await this.findOne(id, projectId); // Check existence

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.overrideBaseUrl !== undefined) updateData.overrideBaseUrl = dto.overrideBaseUrl;
    if (dto.endpoint !== undefined) updateData.endpoint = dto.endpoint;
    if (dto.method !== undefined) updateData.method = dto.method;
    if (dto.headers !== undefined) updateData.headers = dto.headers;
    if (dto.queryParams !== undefined) updateData.queryParams = dto.queryParams;
    if (dto.requestBody !== undefined) updateData.requestBody = dto.requestBody;
    if (dto.responseMapping !== undefined) updateData.responseMapping = dto.responseMapping;
    if (dto.timeout !== undefined) updateData.timeout = dto.timeout;
    if (dto.authRequired !== undefined) updateData.authRequired = dto.authRequired;

    return this.prisma.api.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, projectId: string) {
    await this.findOne(id, projectId); // Check existence

    return this.prisma.api.delete({
      where: { id },
    });
  }
}
