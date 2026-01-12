import { HttpClient } from '../http-client';

export interface SendOtpOptions {
  appId: string;
  recipient: string;
  lang?: 'fr' | 'en' | 'es' | 'de';
  code?: string;
  minutes?: number;
}

export interface VerifyOtpResult {
  reason: string;
  status: number;
  msg: string;
}

export class OtpApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Create and send OTP
   * 
   * @param options OTP options
   * @returns OtpResult
   */
  async create(options: SendOtpOptions): Promise<OtpResult> {
    const payload: Record<string, any> = {
      appId: options.appId,
      recipient: options.recipient,
      lang: options.lang || 'fr',
    };

    if (options.code) {
      payload.code = options.code;
    }

    if (options.minutes) {
      payload.minutes = options.minutes;
    }

    const response = await this.client.post<any>('/otp/create', payload);
    return new OtpResult(response);
  }

  /**
   * Send OTP with simple parameters
   * 
   * @param appId Application ID
   * @param recipient Phone number or email
   * @param lang Language code (fr, en, es, de)
   */
  async send(appId: string, recipient: string, lang: 'fr' | 'en' | 'es' | 'de' = 'fr'): Promise<OtpResult> {
    return this.create({ appId, recipient, lang });
  }

  /**
   * Send OTP with custom code
   * 
   * @param appId Application ID
   * @param recipient Phone number or email
   * @param code Custom OTP code
   * @param lang Language code
   * @param minutes Expiration time in minutes
   */
  async sendWithCustomCode(
    appId: string,
    recipient: string,
    code: string,
    lang: 'fr' | 'en' | 'es' | 'de' = 'fr',
    minutes?: number
  ): Promise<OtpResult> {
    return this.create({ appId, recipient, lang, code, minutes });
  }

  /**
   * Send OTP with expiration time
   * 
   * @param appId Application ID
   * @param recipient Phone number or email
   * @param minutes Expiration time in minutes
   * @param lang Language code
   */
  async sendWithExpiration(
    appId: string,
    recipient: string,
    minutes: number,
    lang: 'fr' | 'en' | 'es' | 'de' = 'fr'
  ): Promise<OtpResult> {
    return this.create({ appId, recipient, lang, minutes });
  }

  /**
   * Verify OTP code
   * 
   * @param appId Application ID
   * @param key Key returned from create()
   * @param code OTP code entered by user
   */
  async verify(appId: string, key: string, code: string): Promise<VerifyOtpResult> {
    const response = await this.client.post<any>('/otp/verify', {
      appId,
      key,
      code,
    });

    return {
      reason: response.reason || '',
      status: response.status || 0,
      msg: response.msg || '',
    };
  }

  /**
   * Check if OTP verification was successful
   */
  isVerified(result: VerifyOtpResult): boolean {
    return result.status === 200 && result.msg === 'checked';
  }
}

/**
 * OTP Result wrapper class
 */
export class OtpResult {
  private response: any;

  constructor(response: any) {
    this.response = response;
  }

  /**
   * Check if OTP was sent successfully
   */
  isSuccess(): boolean {
    return this.response.reason === 'success';
  }

  /**
   * Get the key (needed for verification)
   */
  getKey(): string {
    return this.response.key || this.response.data?.key || '';
  }

  /**
   * Get recipient
   */
  getRecipient(): string {
    return this.response.recipient || this.response.data?.recipient || '';
  }

  /**
   * Get status
   */
  getStatus(): string {
    return this.response.status || this.response.data?.status || '';
  }

  /**
   * Get message ID
   */
  getMessageId(): string {
    return this.response.messageId || this.response.data?.messageId || '';
  }

  /**
   * Get raw response
   */
  getRawResponse(): any {
    return this.response;
  }
}
