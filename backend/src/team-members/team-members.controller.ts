import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('team-members')
export class TeamMembersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.teamMember.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
