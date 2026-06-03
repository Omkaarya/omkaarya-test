/**
 * Form validation utilities for consistent validation across forms
 */

export interface FormFieldError {
  [fieldName: string]: string;
}

/**
 * Check if a value is empty (null, undefined, empty string, or whitespace-only string)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Validate a single required field
 * Returns error message if invalid, empty string if valid
 */
export function validateRequired(
  value: unknown,
  fieldName: string,
  customMessage?: string
): string {
  if (isEmpty(value)) {
    return customMessage || `${fieldName} is required`;
  }
  return '';
}

/**
 * Validate email format
 */
export function validateEmail(email: string, fieldName = 'Email'): string {
  if (isEmpty(email)) {
    return `${fieldName} is required`;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return `${fieldName} must be a valid email address`;
  }
  return '';
}

/**
 * Validate phone number format (8-15 digits)
 */
export function validatePhoneNumber(phone: string, fieldName = 'Phone'): string {
  if (isEmpty(phone)) {
    return ''; // Only validate if provided
  }
  const phoneRegex = /^\d{8,15}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    return `${fieldName} must be 8-15 digits`;
  }
  return '';
}

/**
 * Validate multiple required fields at once
 * Returns object with field names as keys and error messages as values
 * Only includes errors for fields that have values
 */
export function validateRequiredFields(
  fields: Record<string, unknown>,
  fieldLabels?: Record<string, string>
): FormFieldError {
  const errors: FormFieldError = {};

  for (const [fieldName, value] of Object.entries(fields)) {
    if (isEmpty(value)) {
      const label = fieldLabels?.[fieldName] || fieldName;
      errors[fieldName] = `${label} is required`;
    }
  }

  return errors;
}

/**
 * Check if there are any validation errors
 */
export function hasErrors(errors: FormFieldError): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get all error messages as array
 */
export function getErrorMessages(errors: FormFieldError): string[] {
  return Object.values(errors).filter((msg) => msg && msg.length > 0);
}
