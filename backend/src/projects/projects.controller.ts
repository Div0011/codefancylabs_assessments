import { Controller, Get, Param, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { IsOptional, IsInt } from 'class-validator';

class FilterProjectDto {
  @IsOptional()
  @IsInt()
  clientId?: number;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@Query() filter: FilterProjectDto) {
    return this.projectsService.findAll(filter.clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateProjectStatusDto: UpdateProjectStatusDto) {
    return this.projectsService.updateStatus(+id, updateProjectStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
