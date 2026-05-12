import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiDto, UpdateApiDto } from './dto';

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}

  async create(collectionId: string, dto: CreateApiDto) {
    return this.prisma.api.create({
      data: {
        collectionId,
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

  async findAll(collectionId: string) {
    return this.prisma.api.findMany({
      where: { collectionId },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, collectionId: string) {
    const api = await this.prisma.api.findFirst({
      where: { id, collectionId },
    });

    if (!api) {
      throw new NotFoundException('API not found');
    }

    return api;
  }

  async update(id: string, collectionId: string, dto: UpdateApiDto) {
    await this.findOne(id, collectionId); // Check existence

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

  async remove(id: string, collectionId: string) {
    await this.findOne(id, collectionId); // Check existence

    return this.prisma.api.delete({
      where: { id },
    });
  }
}
