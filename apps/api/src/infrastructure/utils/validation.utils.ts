import { ValidationError } from '@nestjs/common';

/**
 * A single extracted validation error, flattened to a leaf field path.
 */
export interface ExtractedValidationError {
  /** Dot-separated path to the offending field (e.g. `users.0.email`). */
  field: string;
  /** The raw (untranslated) validation message / i18n key. */
  message: string;
}

/**
 * Recursively extracts every validation constraint from a class-validator
 * `ValidationError` tree, preserving the full field path for nested
 * objects and arrays.
 *
 * Performance characteristics:
 * - Single pass over the error tree — O(n) where n = total nodes.
 * - No intermediate arrays are retained beyond the final result.
 *
 * Example:
 * ```
 * // Input:
 * //   { property: 'users',
 * //     children: [
 * //       { property: '0',
 * //         children: [{ property: 'email', constraints: { isEmail: '...' } }] }
 * //     ]
 * //   }
 * extractAllValidationMessages(errors)
 * // => [{ field: 'users.0.email', message: '...' }]
 * ```
 */
export function extractAllValidationMessages(
  errors: ValidationError[],
  parentPath = '',
): ExtractedValidationError[] {
  const extracted: ExtractedValidationError[] = [];

  for (const error of errors) {
    const currentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    // Leaf-level constraints (e.g. isString, isEmail, minLength …)
    if (error.constraints) {
      for (const message of Object.values(error.constraints)) {
        extracted.push({ field: currentPath, message });
      }
    }

    // Recurse into nested object properties / array elements
    if (error.children && error.children.length > 0) {
      extracted.push(
        ...extractAllValidationMessages(error.children, currentPath),
      );
    }
  }

  return extracted;
}
