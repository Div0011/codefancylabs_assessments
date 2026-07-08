import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, TaskPriority, TaskStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();

    const activeProjects = await this.prisma.project.count({
      where: { status: ProjectStatus.ACTIVE },
    });

    const pendingTasks = await this.prisma.task.count({
      where: { status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] } },
    });

    const overdueTasks = await this.prisma.task.count({
      where: {
        status: { not: TaskStatus.COMPLETED },
        dueDate: { lt: now },
      },
    });

    const highPriorityPending = await this.prisma.task.count({
      where: {
        status: { not: TaskStatus.COMPLETED },
        priority: TaskPriority.HIGH,
      },
    });

    const recentProjects = await this.prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true, tasks: true },
    });

    const recentTasks = await this.prisma.task.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { include: { client: true } },
        assignee: true,
      },
    });

    const projectsByStatus = await this.prisma.project.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const tasksByStatus = await this.prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return {
      activeProjects,
      pendingTasks,
      overdueTasks,
      highPriorityPending,
      recentProjects,
      recentTasks,
      projectsByStatus,
      tasksByStatus,
    };
  }
}
