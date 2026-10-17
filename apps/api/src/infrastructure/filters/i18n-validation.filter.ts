import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { AsyncLoggerService } from '../logger/async-logger.service.js';
import {
  extractAllValidationMessages,
  ExtractedValidationError,
} from '../utils/validation.utils.js';
import { statusCodeToErrorCode, toErrorCode } from '../utils/error-code.util.js';

/** Unified failure-response schema (see requirements). */
export interface FailureResponse {
  success: false;
  statusCode: number;
  path: string;
  timestamp: string;
  errorCode: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

const DEFAULT_LANG = 'ar';

/**
 * Global exception filter that catches every thrown value and produces
 * the unified failure-response schema, translating all i18n keys that
 * start with `common.` into the request language.
 *
 * - Catches HttpException (including validation) and unexpected Errors.
 * - Extracts nested validation errors preserving field paths.
 * - Translates messages in parallel with Promise.all (avoids N+1).
 * - Formats errorCode into UPPER_SNAKE_CASE.
 * - Logs asynchronously (fire-and-forget with .catch()).
 * - Hides internal stack traces from public responses.
 */
@Catch()
export class I18nValidationFilter implements ExceptionFilter {
  constructor(
    @Inject(I18nService)
    private readonly i18n: I18nService,
    private readonly asyncLogger: AsyncLoggerService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    console.error('🔥 EXCEPTION CAUGHT BY FILTER:', exception);
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    this.asyncLogger.logError(exception, 'I18nValidationFilter');

    const statusCode: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const path: string = req?.url ?? req?.path ?? '';
    const lang = this.resolveLanguage(host, req);
    const exceptionResponse: unknown =
      exception instanceof HttpException ? exception.getResponse() : null;

    const validationErrors = this.getValidationErrors(exceptionResponse);

    if (validationErrors) {
      const extracted = extractAllValidationMessages(validationErrors);
      const translated = await this.translateInParallel(extracted, lang);
      const mainMessage = this.translate(
        this.getRawMessage(exceptionResponse),
        lang,
        host,
      );

      const body: FailureResponse = {
        success: false,
        statusCode,
        path,
        timestamp: new Date().toISOString(),
        errorCode: 'VALIDATION_FAILED',
        message: mainMessage,
        ...(translated.length > 0 && { errors: translated }),
      };
      res.status(statusCode).json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const errorCode = this.resolveErrorCode(
        exception,
        exceptionResponse,
        statusCode,
      );
      const mainMessage = this.translate(
        this.getHttpMessage(exception, statusCode),
        lang,
        host,
      );

      const body: FailureResponse = {
        success: false,
        statusCode,
        path,
        timestamp: new Date().toISOString(),
        errorCode,
        message: mainMessage,
      };
      res.status(statusCode).json(body);
      return;
    }

    const body: FailureResponse = {
      success: false,
      statusCode,
      path,
      timestamp: new Date().toISOString(),
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: this.translate('common.error.INTERNAL_SERVER_ERROR', lang, host),
    };
    res.status(statusCode).json(body);
  }

  // ─── Language resolution ──────────────────────────────────────────────

  /**
   * Resolves the request language in three fallback tiers:
   *  1. Async-hook / request-attached I18nContext (set by I18nMiddleware).
   *  2. Parsed accept-language header matched against supported languages.
   *  3. Hard-coded default (ar).
   */
  private resolveLanguage(host: ArgumentsHost, request: any): string {
    const ctx = I18nContext.current(host);
    if (ctx?.lang) {
      return ctx.lang;
    }

    const acceptLanguage: string | undefined =
      request?.headers?.['accept-language'];
    if (acceptLanguage) {
      try {
        const supported = this.i18n.getSupportedLanguages();
        const parsed = acceptLanguage
          .split(',')
          .map((part: string) => {
            const [code, ...params] = part.trim().split(';');
            const qParam = params.find((p) => p.trim().startsWith('q='));
            const quality = qParam ? parseFloat(qParam.trim().slice(2)) : 1.0;
            return { code: code.trim(), quality: isNaN(quality) ? 0 : quality };
          })
          .sort(
            (a: { quality: number }, b: { quality: number }) =>
              b.quality - a.quality,
          );

        for (const entry of parsed) {
          const short = entry.code.split('-')[0];
          if (supported.includes(short)) {
            return short;
          }
        }
      } catch {
        // fall through to default
      }
    }

    return DEFAULT_LANG;
  }

  // ─── Translation helpers ──────────────────────────────────────────────

  /**
   * Translates a single message. Only keys prefixed with `common.` are
   * sent to the i18n service; anything else is returned verbatim.
   */
  private translate(key: string, lang: string, host?: ArgumentsHost): string {
    if (!key || !key.startsWith('common.')) {
      return key;
    }
    try {
      const ctx = host ? I18nContext.current(host) : undefined;
      if (ctx) {
        return ctx.t(key as never);
      }
      return this.i18n.t(key as never, { lang });
    } catch {
      return key;
    }
  }

  /**
   * Translates extracted validation errors in parallel with Promise.all,
   * avoiding the classic N+1 bottleneck when many nested fields fail.
   */
  private translateInParallel(
    extracted: ExtractedValidationError[],
    lang: string,
  ): Promise<Array<{ field: string; message: string }>> {
    return Promise.all(
      extracted.map(async ({ field, message }) => ({
        field,
        message: this.translate(message, lang),
      })),
    );
  }

  // ─── Detection helpers ────────────────────────────────────────────────

  /**
   * Returns the ValidationError[] if the exception came from the
   * ValidationPipe (via our custom exceptionFactory); otherwise null.
   */
  private getValidationErrors(response: unknown): any[] | null {
    if (
      response !== null &&
      typeof response === 'object' &&
      Array.isArray((response as any).errors) &&
      (response as any).errors.length > 0 &&
      (response as any).errors[0]?.property !== undefined
    ) {
      return (response as any).errors;
    }
    return null;
  }

  private getRawMessage(response: unknown): string {
    if (response !== null && typeof response === 'object') {
      const msg = (response as any).message;
      if (typeof msg === 'string' && msg) return msg;
      if (Array.isArray(msg) && typeof msg[0] === 'string') return msg[0];
    }
    return 'common.error.VALIDATION_FAILED';
  }

  private getHttpMessage(exception: HttpException, statusCode: number): string {
    const response = exception.getResponse();
    if (typeof response === 'string' && response) return response;
    if (response !== null && typeof response === 'object') {
      const msg = (response as any).message;
      if (typeof msg === 'string' && msg) return msg;
    }
    return HttpStatus[statusCode] ?? 'INTERNAL_SERVER_ERROR';
  }

  /**
   * Derives an UPPER_SNAKE_CASE error code from the HttpException body
   * (the `error` property) or falls back to the status-code text.
   */
  private resolveErrorCode(
    exception: HttpException,
    response: unknown,
    statusCode: number,
  ): string {
    void exception;
    if (response !== null && typeof response === 'object') {
      const err = (response as any).error;
      if (typeof err === 'string' && err) {
        return toErrorCode(err);
      }
      const msg = (response as any).message;
      if (typeof msg === 'string' && msg.startsWith('common.error.')) {
        return toErrorCode(msg.replace(/^common\.error\./, ''));
      }
    }
    return statusCodeToErrorCode(statusCode);
  }
}
