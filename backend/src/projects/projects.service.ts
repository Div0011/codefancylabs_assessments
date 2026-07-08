import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, TaskStatus } from '@prisma/client';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(clientId?: number) {
    return this.prisma.project.findMany({
      where: clientId ? { clientId } : undefined,
      include: { client: true, tasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { client: true, tasks: { include: { assignee: true } } },
    });
  }

  create(data: CreateProjectDto) {
    return this.prisma.project.create({
      data,
      include: { client: true, tasks: true },
    });
  }

  update(id: number, data: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data,
      include: { client: true, tasks: true },
    });
  }

  async updateStatus(id: number, dto: UpdateProjectStatusDto) {
    if (dto.status === ProjectStatus.COMPLETED) {
      const unfinished = await this.prisma.task.count({
        where: {
          projectId: id,
          status: { not: TaskStatus.COMPLETED },
        },
      });
      if (unfinished > 0) {
        throw new BadRequestException(
          'Cannot mark project as Completed while it still contains unfinished tasks.',
        );
      }
    }
    return this.prisma.project.update({
      where: { id },
      data: { status: dto.status },
      include: { client: true, tasks: true },
    });
  }

  remove(id: number) {
    return this.prisma.project.delete({ where: { id } });
  }
}
