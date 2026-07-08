import { Module } from '@nestjs/common';
import { TeamMembersController } from './team-members.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamMembersController],
})
export class TeamMembersModule {}
