// Validation utility functions

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Vietnamese phone number
 * @param phone - Phone number string to validate
 * @returns True if phone number is valid
 */
export function isValidVietnamesePhone(phone: string): boolean {
  const phoneRegex = /^(0|84|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validates URL format
 * @param url - URL string to validate
 * @returns True if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if string is not empty and not just whitespace
 * @param str - String to validate
 * @returns True if string has content
 */
export function hasContent(str: string): boolean {
  return str && str.trim().length > 0;
}

/**
 * Validates if string length is within range
 * @param str - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns True if string length is valid
 */
export function isValidLength(str: string, minLength: number, maxLength: number): boolean {
  const length = str ? str.length : 0;
  return length >= minLength && length <= maxLength;
}

/**
 * Validates if number is within range
 * @param num - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if number is within range
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * Validates if string contains only alphanumeric characters
 * @param str - String to validate
 * @returns True if string is alphanumeric
 */
export function isAlphanumeric(str: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(str);
}

/**
 * Validates if string contains only Vietnamese characters and spaces
 * @param str - String to validate
 * @returns True if string contains valid Vietnamese characters
 */
export function isValidVietnameseText(str: string): boolean {
  const vietnameseRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêô\s]+$/;
  return vietnameseRegex.test(str);
}

/**
 * Validates date format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns True if date format is valid
 */
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates if date is in the future
 * @param date - Date to validate
 * @returns True if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Validates if date is in the past
 * @param date - Date to validate
 * @returns True if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Validates if date is within a specific range
 * @param date - Date to validate
 * @param startDate - Start date of range
 * @param endDate - End date of range
 * @returns True if date is within range
 */
export function isDateInRange(
  date: Date | string, 
  startDate: Date | string, 
  endDate: Date | string
): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const startObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const endObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return dateObj >= startObj && dateObj <= endObj;
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @param minLength - Minimum length (default: 8)
 * @returns Object with validation results
 */
export function validatePassword(password: string, minLength: number = 8) {
  const hasMinLength = password.length >= minLength;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  ].filter(Boolean).length;
  
  return {
    isValid: strength >= 3,
    strength,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  };
}
