import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Client for making HTTP requests
 */
export class ApiClient {
  static baseUrl = '';
  static timeout = 30000;

  /**
   * Build full URL with query parameters
   */
  static buildUrl(path: string, queryParams: Record<string, any> = {}): string {
    const url = this.baseUrl + path;
    const params = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * GET request
   */
  static async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axios.get(url, {
      ...config,
      timeout: this.timeout,
    });
  }

  /**
   * POST request
   */
  static async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axios.post(url, data, {
      ...config,
      timeout: this.timeout,
    });
  }

  /**
   * PUT request
   */
  static async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axios.put(url, data, {
      ...config,
      timeout: this.timeout,
    });
  }

  /**
   * PATCH request
   */
  static async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axios.patch(url, data, {
      ...config,
      timeout: this.timeout,
    });
  }

  /**
   * DELETE request
   */
  static async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return await axios.delete(url, {
      ...config,
      timeout: this.timeout,
    });
  }
}
