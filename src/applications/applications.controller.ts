import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreateApplicationDTO } from './applications.dto';
import { ApplicationsService } from './applications.service';
import type { ApplicationResponse } from './types';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationService: ApplicationsService) {}

  // 201 by default, which is what we want: this creates a resource.
  @Post()
  createApplication(
    @Body() body: CreateApplicationDTO,
    @Res({ passthrough: true }) response: Response,
  ): ApplicationResponse {
    const application = this.applicationService.createApplication(body);

    response.setHeader('Location', `/applications/${application.id}`);

    return application;
  }
}
