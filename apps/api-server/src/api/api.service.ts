import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiDto, UpdateApiDto } from './dto';

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateApiDto) {
    return this.prisma.api.create({
      data: {
        ...dto,
        projectId,
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

    return this.prisma.api.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, projectId: string) {
    await this.findOne(id, projectId); // Check existence

    return this.prisma.api.delete({
      where: { id },
    });
  }
}
