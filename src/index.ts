import { HttpClient } from './http-client';
import { SmsApi } from './api/sms';
import { OtpApi } from './api/otp';
import { CampaignApi } from './api/campaign';
import { KyaSmsConfig } from './types';

// Export types
export * from './types';

// Export exceptions
export * from './exceptions';

// Export API classes and results
export { SmsApi, SmsResult } from './api/sms';
export { OtpApi, OtpResult, SendOtpOptions, VerifyOtpResult } from './api/otp';
export { 
  CampaignApi, 
  CampaignResult, 
  CreateCampaignOptions, 
  CampaignType, 
  SmsType, 
  PeriodicType,
  CampaignContent 
} from './api/campaign';

/**
 * KYA SMS Client
 * 
 * @example
 * ```typescript
 * import { KyaSms } from '@kyasms/sdk';
 * 
 * const client = new KyaSms('your-api-key');
 * 
 * // Send SMS
 * const result = await client.sms.sendSimple('MyApp', '22990123456', 'Hello!');
 * console.log(result.getMessageId());
 * ```
 */
export class KyaSms {
  private httpClient: HttpClient;
  private _sms: SmsApi;
  private _otp: OtpApi;
  private _campaign: CampaignApi;

  /**
   * Create a new KYA SMS client
   * 
   * @param apiKeyOrConfig - API key string or full configuration object
   * @param baseUrl - Optional base URL (only if first param is API key)
   */
  constructor(apiKeyOrConfig: string | KyaSmsConfig, baseUrl?: string) {
    let config: KyaSmsConfig;

    if (typeof apiKeyOrConfig === 'string') {
      config = {
        apiKey: apiKeyOrConfig,
        baseUrl: baseUrl || 'https://route.kyasms.com/api/v3',
      };
    } else {
      config = {
        baseUrl: 'https://route.kyasms.com/api/v3',
        ...apiKeyOrConfig,
      };
    }

    this.httpClient = new HttpClient(config);
    this._sms = new SmsApi(this.httpClient);
    this._otp = new OtpApi(this.httpClient);
    this._campaign = new CampaignApi(this.httpClient);
  }

  /**
   * Create client from environment variables
   * Looks for KYA_SMS_API_KEY and optionally KYA_SMS_BASE_URL
   */
  static fromEnvironment(): KyaSms {
    const apiKey = process.env.KYA_SMS_API_KEY;
    
    if (!apiKey) {
      throw new Error('KYA_SMS_API_KEY environment variable is not set');
    }

    return new KyaSms({
      apiKey,
      baseUrl: process.env.KYA_SMS_BASE_URL,
    });
  }

  /**
   * Get SMS API
   */
  get sms(): SmsApi {
    return this._sms;
  }

  /**
   * Get OTP API
   */
  get otp(): OtpApi {
    return this._otp;
  }

  /**
   * Get Campaign API
   */
  get campaign(): CampaignApi {
    return this._campaign;
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string): void {
    this.httpClient.setApiKey(apiKey);
  }

  /**
   * Update base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.httpClient.setBaseUrl(baseUrl);
  }
}

// Default export
export default KyaSms;
