const axios = require('axios');
const { ApiClient } = require('../core/api_client');
const { normalizeResponse } = require('../core/api_response');

/**
 * login Collection
 * 
 * Base Path: /auth
 */
class Login {
  /**
   * createAccount
   * 
   * Endpoint: /auth/createAccount
   */
  static async createAccount({
    body,
    headers,
  } = {}) {
    const url = ApiClient.buildUrl('/auth/createAccount', {
    });

    const requestHeaders = {
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

    return normalizeResponse(response);
  }

}

module.exports = { Login };
