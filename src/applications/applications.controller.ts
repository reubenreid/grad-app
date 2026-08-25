import { Body, Controller, Post } from '@nestjs/common';
import { CreateApplicationDTO } from './applications.dto';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationService: ApplicationsService) {}

  @Post()
  createApplication(@Body() body: CreateApplicationDTO) {
    return this.applicationService.createApplication(body);
  }
}
