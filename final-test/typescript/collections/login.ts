import axios from 'axios';
import { ApiClient } from '../core/api_client';
import { ApiResponse, normalizeResponse } from '../core/api_response';
import {
  CreateAccountBody,
  CreateAccountHeaders,
  CreateAccountResponse,
} from '../models/login_models';

/**
 * login Collection
 * 
 * Base Path: /auth
 */
export class Login {
  /**
   * createAccount
   * 
   * Endpoint: /auth/createAccount
   */
  static async createAccount({
    body,
    headers,
  }: {
    body: CreateAccountBody;
    headers?: CreateAccountHeaders;
  } = {}): Promise<ApiResponse<CreateAccountResponse>> {
    const url = ApiClient.buildUrl('/auth/createAccount', {
    });

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    let response;
    switch ('POST') {
      case 'GET':
        response = await ApiClient.get(url, { headers: requestHeaders });
        break;
      case 'POST':
        response = await ApiClient.post(url, body, { headers: requestHeaders });
        break;
      case 'PUT':
        response = await ApiClient.put(url, body, { headers: requestHeaders });
        break;
      case 'PATCH':
        response = await ApiClient.patch(url, body, { headers: requestHeaders });
        break;
      case 'DELETE':
        response = await ApiClient.delete(url, { headers: requestHeaders });
        break;
    }

    return normalizeResponse<CreateAccountResponse>(response);
  }

}
