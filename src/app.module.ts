import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { ApplicationsModule } from './applications/applications.module';

// Registered as a provider rather than in main.ts so that tests booting the
// module get exactly the same request handling as the running server.
const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) =>
    new BadRequestException({
      statusCode: 400,
      code: 'INVALID_REQUEST',
      message: `We couldn't read that application. Please check the fields listed below.`,
      details: errors.flatMap((error) =>
        Object.values(error.constraints ?? {}),
      ),
    }),
});

@Module({
  imports: [ApplicationsModule],
  controllers: [],
  providers: [{ provide: APP_PIPE, useValue: validationPipe }],
})
export class AppModule {}
