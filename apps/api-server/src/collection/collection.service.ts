import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        basePath: dto.basePath,
        headers: dto.headers || {},
      },
      include: {
        apis: true,
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.collection.findMany({
      where: { projectId },
      include: {
        apis: true,
        _count: {
          select: {
            apis: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, projectId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, projectId },
      include: {
        apis: true,
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async update(id: string, projectId: string, dto: UpdateCollectionDto) {
    await this.findOne(id, projectId); // Check existence

    return this.prisma.collection.update({
      where: { id },
      data: dto,
      include: {
        apis: true,
      },
    });
  }

  async remove(id: string, projectId: string) {
    await this.findOne(id, projectId); // Check existence

    return this.prisma.collection.delete({
      where: { id },
    });
  }
}
