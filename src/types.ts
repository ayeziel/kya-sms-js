// ============================================
// Configuration Types
// ============================================

export interface KyaSmsConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

// ============================================
// SMS Types
// ============================================

export interface SendSmsOptions {
  from: string;
  to: string | string[];
  message?: string;
  type?: 'text' | 'flash';
  wallet?: string;
  callbackUrl?: string;
  refCustom?: string;
  isBulk?: boolean;
  isTemplate?: boolean;
  template?: {
    id: string;
    lang: string;
  };
}

export interface SmsResponseData {
  messageId: string;
  status: string;
  to: string;
  message: string;
  route: string;
  sms_part: number;
  price: number;
  created_at: string;
}

export interface SmsResponse {
  reason: string;
  from: string;
  wallet: string;
  callback_url: string;
  data: SmsResponseData[];
}

export interface SmsHistoryFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
  status?: string;
  sender?: string;
  contact?: string;
}

export interface SmsHistoryMessage {
  messageId: string;
  to: string;
  from: string;
  message: string;
  status: string;
  route: string;
  sms_parts: number;
  price: number;
  type: string;
  campaign_id?: number;
  ref_custom?: string;
  created_at: string;
  updated_at: string;
}

export interface SmsHistoryResponse {
  messages: SmsHistoryMessage[];
  pagination: PaginationInfo;
}

export interface MessageStatusResponse {
  [messageId: string]: {
    phone: string;
    status: string;
    route: string;
    sms_parts: number;
    price: number;
    updated_at: string;
  } | null;
}

// ============================================
// OTP Types
// ============================================

export interface SendOtpOptions {
  to: string;
  from?: string;
  digits?: number;
  validity?: number;
  message?: string;
  wallet?: string;
}

export interface OtpResponse {
  reason: string;
  otp_id: string;
  to: string;
  status: string;
  expires_at: string;
}

export interface VerifyOtpOptions {
  otpId: string;
  code: string;
}

export interface VerifyOtpResponse {
  reason: string;
  otp_id: string;
  valid: boolean;
  message: string;
}

// ============================================
// Campaign Types
// ============================================

export type CampaignType = 'automatic' | 'custom' | 'periodic';
export type ScheduleType = 
  | 'weekly_start' 
  | 'weekly_end' 
  | 'monthly_start' 
  | 'monthly_end' 
  | 'specific_day_of_month' 
  | 'yearly';
export type SmsType = 'Plain Text' | 'Flash' | 'Unicode';

export interface CreateCampaignOptions {
  name: string;
  groups: string[];
  senderId: string;
  type?: CampaignType;
  message?: string;
  executionDate?: string;
  timezone?: string;
  scheduleType?: ScheduleType;
  smsType?: SmsType;
  wallet?: string;
  isTemplate?: boolean;
  templateId?: string;
  templateLang?: string;
}

export interface CampaignResponse {
  reason: string;
  campaign_id: number;
  status: string;
  scheduled_at?: string;
}

export interface CampaignStatusResponse {
  reason: string;
  data: {
    campaign_id: number;
    name: string;
    status: string;
    type: string;
    progress?: {
      total: number;
      sent: number;
      delivered: number;
      failed: number;
      pending: number;
    };
    execution_date?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CampaignStats {
  total_sent: number;
  delivered: number;
  failed: number;
  pending: number;
  total_cost: number;
  total_sms_parts: number;
  delivery_rate: number;
}

export interface CampaignRecord {
  id: number;
  name: string;
  type: string;
  status: string;
  sender: string;
  sms_type: string;
  is_template: boolean;
  template_id?: number;
  template_name?: string;
  execution_date?: string;
  schedule_type?: string;
  timezone?: string;
  sms_content: string;
  groups: Array<{ id: string; name: string }>;
  stats: CampaignStats;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecordsResponse {
  campaigns: CampaignRecord[];
  pagination: PaginationInfo;
}

export interface CalculateCostOptions {
  groups: string[];
  message: string;
}

export interface CountryBreakdown {
  country: string;
  operator: string;
  contacts: number;
  sms_parts: number;
  cost: number;
  price_per_sms: number;
}

export interface CalculateCostResponse {
  estimated_cost: number;
  total_recipients: number;
  valid_recipients: number;
  invalid_contacts: number;
  total_sms_parts: number;
  average_sms_parts: number;
  message_info: {
    encoding: string;
    characters_used: number;
    characters_per_message: number;
    base_sms_parts: number;
    has_dynamic_variables: boolean;
  };
  country_breakdown: CountryBreakdown[];
  groups_info: Array<{
    id: string;
    name: string;
    contact_count: number;
  }>;
  is_estimate?: boolean;
}

// ============================================
// Common Types
// ============================================

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_records: number;
  has_more: boolean;
  records_limited?: boolean;
}

export interface ApiErrorResponse {
  reason: string;
  message: string;
  errors?: Record<string, string | string[]>;
}
