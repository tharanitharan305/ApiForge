import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        userId,
      },
      include: {
        collections: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        collections: {
          include: {
            _count: {
              select: {
                apis: true,
              },
            },
          },
        },
        _count: {
          select: {
            collections: true,
            exports: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        collections: {
          include: {
            apis: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId); // Check existence

    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: {
        collections: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check existence

    return this.prisma.project.delete({
      where: { id },
    });
  }
}
