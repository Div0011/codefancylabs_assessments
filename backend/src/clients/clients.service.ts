import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.findMany({
      include: { projects: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { projects: true },
    });
  }

  create(data: { name: string; email?: string; company?: string }) {
    return this.prisma.client.create({ data });
  }

  update(id: number, data: { name?: string; email?: string; company?: string }) {
    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.client.delete({ where: { id } });
  }
}
