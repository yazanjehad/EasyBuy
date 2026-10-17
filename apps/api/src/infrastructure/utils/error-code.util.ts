/**
 * Formats an arbitrary error identifier into **UPPER_SNAKE_CASE** so that
 * every `errorCode` in the unified failure response follows a single
 * machine-readable convention.
 *
 * Examples:
 * ```
 * toErrorCode('Bad Request')           // => 'BAD_REQUEST'
 * toErrorCode('Not Found')             // => 'NOT_FOUND'
 * toErrorCode('common.error.NOT_FOUND')// => 'COMMON_ERROR_NOT_FOUND'
 * ```
 */
export function toErrorCode(identifier: string): string {
  return identifier
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // camelCase → snake
    .replace(/[\s\-./]+/g, '_') // separators → underscore
    .replace(/_+/g, '_') // collapse duplicates
    .replace(/^_|_$/g, '') // trim edges
    .toUpperCase();
}

/**
 * Maps an HTTP status code to a default error-code fallback when no
 * more specific identifier is available.
 */
export function statusCodeToErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 500:
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}
