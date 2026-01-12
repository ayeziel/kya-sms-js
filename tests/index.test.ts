import { describe, it, expect } from 'vitest';
import { KyaSms, KyaSmsError, AuthenticationError, ValidationError, ApiError } from '../src';

describe('KyaSms', () => {
  it('should create instance with API key', () => {
    const client = new KyaSms('test-api-key');
    expect(client).toBeInstanceOf(KyaSms);
  });

  it('should have sms property', () => {
    const client = new KyaSms('test-api-key');
    expect(client.sms).toBeDefined();
  });

  it('should have otp property', () => {
    const client = new KyaSms('test-api-key');
    expect(client.otp).toBeDefined();
  });

  it('should have campaign property', () => {
    const client = new KyaSms('test-api-key');
    expect(client.campaign).toBeDefined();
  });
});

describe('Exceptions', () => {
  it('should create ApiError with status code', () => {
    const error = new ApiError('Server error', 500);
    expect(error.statusCode).toBe(500);
    expect(error.isServerError()).toBe(true);
  });
});