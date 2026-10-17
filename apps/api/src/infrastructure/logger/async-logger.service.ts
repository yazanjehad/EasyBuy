import { Injectable, Logger } from '@nestjs/common';

/**
 * Asynchronous, fire-and-forget logger used by the global exception filter
 * to record errors **without blocking** the HTTP response latency.
 *
 * Design notes:
 * - Logging is deferred to a microtask (`Promise.resolve().then(...)`) so
 *   the caller never awaits I/O.
 * - A `.catch()` guard prevents unhandled promise rejections — a common
 *   source of process-level warnings in production Node.js deployments.
 * - If the primary logger itself fails, a last-resort `stderr` write
 *   guarantees the error is never silently swallowed.
 */
@Injectable()
export class AsyncLoggerService {
  private readonly logger = new Logger(AsyncLoggerService.name);

  /**
   * Logs an error asynchronously. This method returns immediately;
   * the actual I/O happens in a subsequent microtask.
   *
   * @param error   The error (or any throwable) to log.
   * @param context Optional label describing where the error originated.
   */
  logError(error: unknown, context?: string): void {
    Promise.resolve()
      .then(() => {
        if (error instanceof Error) {
          this.logger.error(
            error.message,
            error.stack,
            context ?? 'ExceptionHandler',
          );
        } else {
          this.logger.error(
            String(error),
            undefined,
            context ?? 'ExceptionHandler',
          );
        }
      })
      .catch((loggingError: unknown) => {
        // Last-resort synchronous write — prevents unhandled rejection.
        process.stderr.write(
          `[${new Date().toISOString()}] AsyncLoggerService: failed to log error: ${
            loggingError instanceof Error
              ? (loggingError.stack ?? loggingError.message)
              : String(loggingError)
          }\n`,
        );
      });
  }

  /**
   * Logs a plain (non-error) message asynchronously.
   *
   * @param message The message to log.
   * @param context Optional context label.
   */
  log(message: string, context?: string): void {
    Promise.resolve()
      .then(() => {
        this.logger.log(message, context ?? 'AsyncLogger');
      })
      .catch(() => {
        // Swallow logging failures silently to avoid unhandled rejections.
      });
  }
}
