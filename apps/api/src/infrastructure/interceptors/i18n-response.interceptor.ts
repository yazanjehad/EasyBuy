import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Inject,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nContext, I18nService } from 'nestjs-i18n';

/** Unified success-response schema (see requirements). */
export interface SuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data?: T | null;
}

const DEFAULT_LANG = 'ar';
const DEFAULT_MESSAGE_KEY = 'common.response.SUCCESS';

/**
 * Standard response interceptor that wraps every **2xx** controller
 * result in the unified success schema and translates any root
 * `message` field whose value is an i18n key (`common.*`).
 *
 * Non-2xx responses are passed through untouched — they are handled
 * by the global exception filter.
 */
@Injectable()
export class I18nResponseInterceptor<T = unknown> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  constructor(
    @Inject(I18nService)
    private readonly i18n: I18nService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    // Only intercept HTTP contexts.
    if (context.getType() !== 'http') {
      return next.handle() as Observable<SuccessResponse<T>>;
    }

    const httpCtx = context.switchToHttp();
    const res = httpCtx.getResponse();
    const req = httpCtx.getRequest();

    const statusCode: number =
      res?.statusCode ?? (req?.method === 'POST' ? 201 : 200);

    // Non-2xx responses: pass through unchanged (handled by exception filter).
    if (statusCode < 200 || statusCode >= 300) {
      return next.handle() as Observable<SuccessResponse<T>>;
    }

    return next.handle().pipe(
      map((body: T): SuccessResponse<T> => {
        const lang = this.resolveLanguage(context, req);
        const { message, data } = this.extractMessageAndData(body);

        const translatedMessage = message
          ? this.translate(message, lang, context)
          : this.translate(DEFAULT_MESSAGE_KEY, lang, context);

        return {
          success: true,
          statusCode,
          message: translatedMessage,
          ...(data !== undefined && { data: data as T | null }),
        };
      }),
    );
  }

  // ─── Body decomposition ───────────────────────────────────────────────

  /**
   * Splits the raw controller return value into `message` + `data`.
   *
   * • If the body already has `message`, it is extracted.
   * • If the body has a `data` key, that is used directly.
   * • Otherwise the remaining keys (without `message`) become `data`.
   * • Primitive bodies become `data` with no explicit message.
   */
  private extractMessageAndData(body: unknown): {
    message: string | null;
    data: unknown;
  } {
    if (body === null || body === undefined) {
      return { message: null, data: body ?? null };
    }

    if (typeof body !== 'object') {
      return { message: null, data: body };
    }

    const obj = body as Record<string, unknown>;
    const message =
      typeof obj.message === 'string' && obj.message.length > 0
        ? obj.message
        : null;

    if ('data' in obj) {
      return { message, data: obj.data };
    }

    if (message !== null) {
      // Strip `message` from the remaining keys.
      const { message: _msg, ...rest } = obj;
      const hasOtherKeys = Object.keys(rest).length > 0;
      return { message, data: hasOtherKeys ? (rest as unknown) : undefined };
    }

    return { message: null, data: obj as unknown };
  }

  // ─── Language resolution ──────────────────────────────────────────────

  private resolveLanguage(context: ExecutionContext, request: any): string {
    const ctx = I18nContext.current(context);
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

  // ─── Translation ──────────────────────────────────────────────────────

  /**
   * Translates a message only if it is an i18n key (`common.*` prefix);
   * anything else is returned verbatim.
   */
  private translate(
    key: string,
    lang: string,
    context?: ExecutionContext,
  ): string {
    if (!key.startsWith('common.')) {
      return key;
    }
    try {
      const ctx = context ? I18nContext.current(context) : undefined;
      if (ctx) {
        return ctx.t(key as never);
      }
      return this.i18n.t(key as never, { lang });
    } catch {
      return key;
    }
  }
}
