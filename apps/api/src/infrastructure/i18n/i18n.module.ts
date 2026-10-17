import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  I18nModule,
  I18nJsonLoader,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { dirname } from 'path';
import { fileURLToPath } from 'node:url';
import { AsyncLoggerService } from '../logger/async-logger.service.js';
import { I18nValidationFilter } from '../filters/i18n-validation.filter.js';
import { I18nResponseInterceptor } from '../interceptors/i18n-response.interceptor.js';

/**
 * Directory of this module.
 *
 * The API compiles to native ESM (`"type": "module"`), where the CommonJS
 * `__dirname` global does not exist. `import.meta.url` works in both the
 * compiled `dist/` output and Jest's ESM runtime, so the JSON translation
 * folders are always resolved next to this file.
 */
const currentDir = dirname(fileURLToPath(import.meta.url));

/**
 * Infrastructure-level composition module for Internationalization.
 *
 * Responsibilities:
 *  - Configure `nestjs-i18n` with JSON loaders from
 *    `src/infrastructure/i18n/{ar,en}/common.json`.
 *  - Detect language from the `accept-language` header
 *    (`AcceptLanguageResolver`, strict-loose matching).
 *  - Default to Arabic (`ar`) when no supported language is found.
 *  - Register the **global** exception filter and response interceptor
 *    via `APP_FILTER` / `APP_INTERCEPTOR` so they participate in the
 *    NestJS DI container (they inject `I18nService`).
 */
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'ar',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: currentDir,
        includeSubfolders: true,
        filePattern: '*.json',
        watch: false,
      },
      resolvers: [
        {
          use: AcceptLanguageResolver,
          options: { matchType: 'strict-loose' },
        },
      ],
      logging: true,
    }),
  ],
  providers: [
    AsyncLoggerService,
    {
      provide: APP_FILTER,
      useClass: I18nValidationFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nResponseInterceptor,
    },
  ],
})
export class I18nConfigModule {}
