import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  ValidationPipe,
  Logger,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Custom exception factory used by the global ValidationPipe.
 *
 * Wraps the raw class-validator `ValidationError[]` tree inside a
 * `BadRequestException` so the global `I18nValidationFilter` can:
 *  - Recursively extract nested field errors (objects & arrays).
 *  - Translate every `common.*` i18n key in the request language.
 *
 * The `target` and `value` fields are stripped from each `ValidationError`
 * to avoid leaking the validated DTO instance (which may contain a
 * hashed password) back to the client.
 */
function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const sanitized = errors.map((e) => sanitizeValidationError(e));

  return new BadRequestException({
    statusCode: 400,
    message: 'common.validation.FAILED',
    errors: sanitized,
  });
}

/**
 * Recursively strips `target` and `value` from a `ValidationError` node.
 * This prevents accidental data leakage while keeping `property`,
 * `constraints`, and `children` intact for the filter to process.
 */
function sanitizeValidationError(error: ValidationError): ValidationError {
  const clean: ValidationError = { property: error.property };

  if (error.constraints) {
    clean.constraints = error.constraints;
  }
  if (error.children && error.children.length > 0) {
    clean.children = error.children.map((child) =>
      sanitizeValidationError(child),
    );
  }
  return clean;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global ValidationPipe — transform / whitelist / forbid + custom factory.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentation for NestJS API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  const baseUrl = await app.getUrl();
  logger.log(`🚀 Application is running on: ${baseUrl}`);
  logger.log(`📄 Swagger Documentation available at: ${baseUrl}/docs`);
}
bootstrap();
