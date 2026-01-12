import { HttpClient } from '../http-client';
import {
  CampaignStatusResponse,
  CampaignRecordsResponse,
  CalculateCostResponse,
} from '../types';

export type CampaignType = 'auto' | 'customize' | 'periodic';
export type SmsType = 'text' | 'flash' | 'unicode';
export type PeriodicType = 
  | 'weekly_start' 
  | 'weekly_end' 
  | 'monthly_start' 
  | 'monthly_end' 
  | 'specific_day_of_month' 
  | 'beginning_of_year'
  | 'christmas';

export interface CampaignContent {
  type: 'message' | 'template';
  message?: string;
  template_id?: string;
  template_default_lang?: string;
}

export interface CreateCampaignOptions {
  name: string;
  groups: string[];
  senderId: string;
  type?: CampaignType;
  smsType?: SmsType;
  content?: CampaignContent;
  message?: string;  // Shorthand for content.message
  templateId?: string;  // Shorthand for content.template_id
  templateLang?: string;  // Shorthand for content.template_default_lang
  timezone?: string;
  scheduleDate?: string;  // For 'customize' type
  campaignPeriodic?: PeriodicType;  // For 'periodic' type
}

export interface CampaignResponse {
  reason: string;
  campaign_id?: number;
  status?: string;
  scheduled_at?: string;
  data?: any;
}

export class CampaignApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Create a campaign with full options
   */
  async create(options: CreateCampaignOptions): Promise<CampaignResult> {
    // Build content object
    let content: CampaignContent;
    
    if (options.content) {
      content = options.content;
    } else if (options.templateId) {
      content = {
        type: 'template',
        template_id: options.templateId,
        template_default_lang: options.templateLang || 'fr',
      };
    } else {
      content = {
        type: 'message',
        message: options.message || '',
      };
    }

    const payload: Record<string, any> = {
      name: options.name,
      type: options.type || 'auto',
      groups: options.groups,
      sender_id: options.senderId,
      sms_type: options.smsType || 'text',
      content: content,
    };

    if (options.timezone) {
      payload.timezone = options.timezone;
    }

    if (options.scheduleDate) {
      payload.schedule_date = options.scheduleDate;
    }

    if (options.campaignPeriodic) {
      payload.campaign_periodic = options.campaignPeriodic;
    }

    const response = await this.client.post<CampaignResponse>('/sms/campaign/create', payload);
    return new CampaignResult(response);
  }

  /**
   * Create an automatic (immediate) campaign
   */
  async createAutomatic(
    name: string,
    groups: string[],
    senderId: string,
    message: string
  ): Promise<CampaignResult> {
    return this.create({
      name,
      groups,
      senderId,
      type: 'auto',
      message,
    });
  }

  /**
   * Create a scheduled campaign
   */
  async createScheduled(
    name: string,
    groups: string[],
    senderId: string,
    message: string,
    scheduleDate: string,
    timezone: string = 'Africa/Porto-Novo'
  ): Promise<CampaignResult> {
    return this.create({
      name,
      groups,
      senderId,
      type: 'customize',
      message,
      scheduleDate,
      timezone,
    });
  }

  /**
   * Create a periodic campaign
   */
  async createPeriodic(
    name: string,
    groups: string[],
    senderId: string,
    message: string,
    periodic: PeriodicType,
    timezone: string = 'Africa/Porto-Novo'
  ): Promise<CampaignResult> {
    return this.create({
      name,
      groups,
      senderId,
      type: 'periodic',
      message,
      campaignPeriodic: periodic,
      timezone,
    });
  }

  /**
   * Create a campaign with template
   */
  async createWithTemplate(
    name: string,
    groups: string[],
    senderId: string,
    templateId: string,
    templateLang: string = 'fr'
  ): Promise<CampaignResult> {
    return this.create({
      name,
      groups,
      senderId,
      type: 'auto',
      templateId,
      templateLang,
    });
  }

  /**
   * Get campaign status
   */
  async getStatus(campaignId: number | string): Promise<CampaignStatusResponse> {
    const response = await this.client.get<CampaignStatusResponse>(
      `/sms/campaign/status/${campaignId}`
    );
    return response;
  }

  /**
   * Get campaign progress percentage
   */
  async getProgress(campaignId: number | string): Promise<number> {
    const status = await this.getStatus(campaignId);
    const progress = status.data?.progress;

    if (!progress || progress.total === 0) {
      return 0;
    }

    return Math.round((progress.sent / progress.total) * 100);
  }

  /**
   * Check if campaign is completed
   */
  async isCompleted(campaignId: number | string): Promise<boolean> {
    const status = await this.getStatus(campaignId);
    return status.data?.status === 'completed' || status.data?.status === 'executed';
  }

  /**
   * Get campaign records/history
   */
  async getRecords(page: number = 1, perPage: number = 20): Promise<CampaignRecordsResponse> {
    const response = await this.client.get<{ reason: string; data: CampaignRecordsResponse }>(
      '/sms/campaign/records',
      {
        page: String(page),
        per_page: String(Math.min(perPage, 50)),
      }
    );

    return response.data;
  }

  /**
   * Get campaign records with filters
   */
  async getRecordsFiltered(filters: {
    page?: number;
    perPage?: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<CampaignRecordsResponse> {
    const params: Record<string, string> = {
      page: String(filters.page || 1),
      per_page: String(Math.min(filters.perPage || 20, 50)),
    };

    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;

    const response = await this.client.get<{ reason: string; data: CampaignRecordsResponse }>(
      '/sms/campaign/records',
      params
    );

    return response.data;
  }

  /**
   * Calculate campaign cost
   */
  async calculateCost(groups: string[], message: string): Promise<CalculateCostResponse> {
    const response = await this.client.post<{ reason: string; data: CalculateCostResponse }>(
      '/sms/campaign/calculate-cost',
      { groups, message }
    );

    return response.data;
  }
}

/**
 * Campaign Result wrapper class
 */
export class CampaignResult {
  private response: CampaignResponse;

  constructor(response: CampaignResponse) {
    this.response = response;
  }

  /**
   * Check if campaign was created successfully
   */
  isSuccess(): boolean {
    return this.response.reason === 'success';
  }

  /**
   * Get campaign ID
   */
  getCampaignId(): number | undefined {
    return this.response.campaign_id || this.response.data?.campaign_id;
  }

  /**
   * Get campaign status
   */
  getStatus(): string | undefined {
    return this.response.status || this.response.data?.status;
  }

  /**
   * Get scheduled execution time
   */
  getScheduledAt(): string | undefined {
    return this.response.scheduled_at || this.response.data?.scheduled_at;
  }

  /**
   * Get raw response
   */
  getRawResponse(): CampaignResponse {
    return this.response;
  }
}
