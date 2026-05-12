import { AxiosResponse } from 'axios';

/**
 * Normalized API Response
 */
export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;

  constructor({ success, message, data, statusCode }: {
    success: boolean;
    message: string;
    data?: T;
    statusCode?: number;
  }) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  toString(): string {
    return `ApiResponse(success: ${this.success}, message: ${this.message}, statusCode: ${this.statusCode})`;
  }
}

/**
 * Normalize axios response to ApiResponse format
 */
export function normalizeResponse<T = any>(response: AxiosResponse): ApiResponse<T> {
  try {
    const data = response.data;
    
    // Extract fields based on response mapping
    const success = data.success !== undefined 
      ? data.success 
      : (response.status >= 200 && response.status < 300);
    const message = data.message || '';
    const responseData = data.data !== undefined ? data.data : data;
    const statusCode = data.statusCode || response.status;

    return new ApiResponse<T>({
      success,
      message,
      data: responseData,
      statusCode,
    });
  } catch (error) {
    return new ApiResponse<T>({
      success: false,
      message: `Failed to parse response: ${error}`,
      data: undefined,
      statusCode: response.status,
    });
  }
}
