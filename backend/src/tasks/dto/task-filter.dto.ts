import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  assigneeId?: number;
}
