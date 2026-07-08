import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TeamMembersModule } from './team-members/team-members.module';

@Module({
  imports: [ClientsModule, ProjectsModule, TasksModule, DashboardModule, TeamMembersModule],
})
export class AppModule {}
