import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { KyaSmsConfig, ApiErrorResponse } from './types';
import {
  KyaSmsError,
  AuthenticationError,
  ValidationError,
  ApiError,
  NetworkError,
} from './exceptions';

export class HttpClient {
  private client: AxiosInstance;
  private apiKey: string;
  private debug: boolean;

  constructor(config: KyaSmsConfig) {
    this.apiKey = config.apiKey;
    this.debug = config.debug || false;

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://route.kyasms.com/api/v3',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'APIKEY': this.apiKey,
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.debug) {
          console.log(`[KyaSMS] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.debug) {
          console.log(`[KyaSMS] Response:`, response.data);
        }
        return response;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: AxiosError<ApiErrorResponse>): KyaSmsError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message;

      switch (status) {
        case 401:
          return new AuthenticationError(message);
        case 422:
          return new ValidationError(message, data?.errors || {});
        case 402:
          return new ApiError('Solde insuffisant. Rechargez votre compte.', status);
        case 429:
          return new ApiError('Trop de requêtes. Veuillez patienter.', status);
        case 404:
          return new ApiError('Ressource non trouvée.', status);
        default:
          return new ApiError(message, status);
      }
    } else if (error.request) {
      return new NetworkError('Impossible de contacter le serveur', error);
    } else {
      return new KyaSmsError(error.message);
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: Record<string, any>): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(url: string, data?: Record<string, any>): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client.defaults.headers['APIKEY'] = apiKey;
  }

  /**
   * Update base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.client.defaults.baseURL = baseUrl;
  }
}
