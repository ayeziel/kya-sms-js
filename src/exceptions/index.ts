/**
 * Base exception for KYA SMS SDK
 */
export class KyaSmsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KyaSmsError';
    Object.setPrototypeOf(this, KyaSmsError.prototype);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends KyaSmsError {
  constructor(message: string = 'Invalid or missing API key') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends KyaSmsError {
  public errors: Record<string, string | string[]>;

  constructor(message: string, errors: Record<string, string | string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Get all validation errors
   */
  getErrors(): Record<string, string | string[]> {
    return this.errors;
  }

  /**
   * Get error for a specific field
   */
  getError(field: string): string | string[] | undefined {
    return this.errors[field];
  }
}

/**
 * API error (4xx, 5xx)
 */
export class ApiError extends KyaSmsError {
  public statusCode: number;
  public errorCode?: string;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Check if error is a rate limit error
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is insufficient balance
   */
  isInsufficientBalance(): boolean {
    return this.statusCode === 402;
  }
}

/**
 * Network/Connection error
 */
export class NetworkError extends KyaSmsError {
  public originalError?: Error;

  constructor(message: string = 'Network error occurred', originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
