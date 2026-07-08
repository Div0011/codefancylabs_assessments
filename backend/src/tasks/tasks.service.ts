import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findAll(filter: TaskFilterDto) {
    return this.prisma.task.findMany({
      where: {
        status: filter.status,
        priority: filter.priority,
        projectId: filter.projectId,
        assigneeId: filter.assigneeId,
      },
      include: {
        project: { include: { client: true } },
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { include: { client: true } },
        assignee: true,
      },
    });
  }

  create(data: CreateTaskDto) {
    const { dueDate, ...rest } = data;
    return this.prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        project: { include: { client: true } },
        assignee: true,
      },
    });
  }

  update(id: number, data: UpdateTaskDto) {
    const { dueDate, ...rest } = data;
    const updateData: any = { ...rest };
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }
    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { include: { client: true } },
        assignee: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
