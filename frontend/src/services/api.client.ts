import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Base URL for the backend API.
 * Can be overridden via environment variable.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Custom error class for API errors.
 */
export class ApiError extends Error {
  public statusCode?: number;
  public originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Creates and configures an Axios instance for API calls.
 * Includes request/response interceptors for authentication and error handling.
 */
class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Sets up request and response interceptors.
   */
  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handles API errors and converts them to ApiError instances.
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const message = (error.response.data as { message?: string })?.message || 
                     error.message || 
                     'An error occurred';
      return new ApiError(message, error.response.status, error);
    } else if (error.request) {
      // Request made but no response received
      return new ApiError(
        'No response from server. Please check your connection.',
        undefined,
        error
      );
    } else {
      // Error setting up the request
      return new ApiError(error.message || 'Request failed', undefined, error);
    }
  }

  /**
   * Sets the authentication token for subsequent requests.
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Gets the authentication token.
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Clears the authentication token.
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Makes a GET request.
   */
  async get<T>(url: string, config?: object): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Makes a POST request.
   */
  async post<T>(url: string, data?: unknown, config?: object): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Makes a PUT request.
   */
  async put<T>(url: string, data?: unknown, config?: object): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Makes a DELETE request.
   */
  async delete<T>(url: string, config?: object): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Makes a PATCH request.
   */
  async patch<T>(url: string, data?: unknown, config?: object): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
