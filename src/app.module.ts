import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [ApplicationsModule],
  controllers: [],
  // Registered as a provider rather than in main.ts so that tests booting the
  // module get exactly the same request handling as the running server.
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule {}
