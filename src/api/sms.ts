import { HttpClient } from '../http-client';
import {
  SendSmsOptions,
  SmsResponse,
  SmsHistoryFilters,
  SmsHistoryResponse,
  MessageStatusResponse,
  SmsResponseData,
} from '../types';

export class SmsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Send SMS with full options
   */
  async send(options: SendSmsOptions): Promise<SmsResult> {
    // Format 'to' as comma-separated string (like PHP SDK)
    const toValue = Array.isArray(options.to) ? options.to.join(',') : options.to;

    const payload: Record<string, any> = {
      from: options.from,
      to: toValue,
      type: options.type || 'text',  // 'text' or 'flash' as string
      isBulk: options.isBulk || false,
      isTemplate: options.isTemplate || false,
      source: 2,  // API source
    };

    if (options.message) {
      payload.message = options.message;
    }

    if (options.wallet) {
      payload.wallet = options.wallet;
    }

    if (options.callbackUrl) {
      payload.callback_url = options.callbackUrl;
    }

    if (options.refCustom) {
      payload.ref_custom = options.refCustom;
    }

    if (options.isTemplate && options.template) {
      payload.template = options.template;
    }

    const response = await this.client.post<SmsResponse>('/sms/send', payload);
    return new SmsResult(response);
  }

  /**
   * Send a simple SMS
   */
  async sendSimple(from: string, to: string | string[], message: string): Promise<SmsResult> {
    return this.send({ from, to, message });
  }

  /**
   * Send a flash SMS (displays directly on screen)
   */
  async sendFlash(from: string, to: string | string[], message: string): Promise<SmsResult> {
    return this.send({ from, to, message, type: 'flash' });
  }

  /**
   * Send SMS using a template
   */
  async sendWithTemplate(
    from: string,
    to: string | string[],
    templateId: string,
    lang: string = 'fr'
  ): Promise<SmsResult> {
    return this.send({
      from,
      to,
      isTemplate: true,
      template: { id: templateId, lang },
    });
  }

  /**
   * Send bulk SMS to groups
   */
  async sendBulk(from: string, groupIds: string[], message: string): Promise<SmsResult> {
    return this.send({
      from,
      to: groupIds.join(','),  // Groups as comma-separated string
      message,
      isBulk: true,
    });
  }

  /**
   * Send bulk SMS with template
   */
  async sendBulkWithTemplate(
    from: string,
    groupIds: string[],
    templateId: string,
    lang: string = 'fr'
  ): Promise<SmsResult> {
    return this.send({
      from,
      to: groupIds.join(','),  // Groups as comma-separated string
      isBulk: true,
      isTemplate: true,
      template: { id: templateId, lang },
    });
  }

  /**
   * Get SMS history
   */
  async getHistory(filters: SmsHistoryFilters = {}): Promise<SmsHistoryResponse> {
    const payload: Record<string, any> = {
      page: filters.page || 1,
      per_page: Math.min(filters.perPage || 50, 100),
    };

    if (filters.startDate) {
      payload.start_date = filters.startDate;
    }

    if (filters.endDate) {
      payload.end_date = filters.endDate;
    }

    if (filters.status) {
      payload.status = filters.status;
    }

    if (filters.sender) {
      payload.sender = filters.sender;
    }

    if (filters.contact) {
      payload.contact = filters.contact;
    }

    const response = await this.client.post<{ reason: string; data: SmsHistoryResponse }>(
      '/sms/history',
      payload
    );

    return response.data;
  }

  /**
   * Get status of multiple messages
   */
  async getStatus(messageIds: string[]): Promise<MessageStatusResponse> {
    const response = await this.client.post<{ reason: string; data: MessageStatusResponse }>(
      '/message/status',
      { message_ids: messageIds.slice(0, 100) }
    );

    return response.data;
  }

  /**
   * Get status of a single message
   */
  async getMessageStatus(messageId: string): Promise<MessageStatusResponse[string]> {
    const statuses = await this.getStatus([messageId]);
    return statuses[messageId];
  }

  /**
   * Check if a message is delivered
   */
  async isDelivered(messageId: string): Promise<boolean> {
    const status = await this.getMessageStatus(messageId);
    return status?.status === 'DELIVERED';
  }
}

/**
 * SMS Result wrapper class
 */
export class SmsResult {
  private response: SmsResponse;

  constructor(response: SmsResponse) {
    this.response = response;
  }

  /**
   * Check if SMS was sent successfully
   */
  isSuccess(): boolean {
    return this.response.reason === 'success';
  }

  /**
   * Get the first message ID
   */
  getMessageId(): string | undefined {
    return this.response.data?.[0]?.messageId;
  }

  /**
   * Get all message IDs
   */
  getMessageIds(): string[] {
    return this.response.data?.map((msg) => msg.messageId) || [];
  }

  /**
   * Get status of first message
   */
  getStatus(): string | undefined {
    return this.response.data?.[0]?.status;
  }

  /**
   * Get route of first message
   */
  getRoute(): string | undefined {
    return this.response.data?.[0]?.route;
  }

  /**
   * Get price of first message
   */
  getPrice(): number {
    return this.response.data?.[0]?.price || 0;
  }

  /**
   * Get total price of all messages
   */
  getTotalPrice(): number {
    return this.response.data?.reduce((sum, msg) => sum + (msg.price || 0), 0) || 0;
  }

  /**
   * Get SMS parts count of first message
   */
  getSmsPart(): number {
    return this.response.data?.[0]?.sms_part || 1;
  }

  /**
   * Get recipient of first message
   */
  getTo(): string | undefined {
    return this.response.data?.[0]?.to;
  }

  /**
   * Get message content
   */
  getMessage(): string | undefined {
    return this.response.data?.[0]?.message;
  }

  /**
   * Get creation date
   */
  getCreatedAt(): string | undefined {
    return this.response.data?.[0]?.created_at;
  }

  /**
   * Get all messages data
   */
  getData(): SmsResponseData[] {
    return this.response.data || [];
  }

  /**
   * Get first message data
   */
  getFirstMessage(): SmsResponseData | undefined {
    return this.response.data?.[0];
  }

  /**
   * Get raw response
   */
  getRawResponse(): SmsResponse {
    return this.response;
  }
}
