const axios = require('axios');

/**
 * API Client for making HTTP requests
 */
class ApiClient {
  static baseUrl = '';
  static timeout = 30000;

  /**
   * Build full URL with query parameters
   */
  static buildUrl(path, queryParams = {}) {
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
  static async get(url, options = {}) {
    return await axios.get(url, {
      ...options,
      timeout: this.timeout,
    });
  }

  /**
   * POST request
   */
  static async post(url, data, options = {}) {
    return await axios.post(url, data, {
      ...options,
      timeout: this.timeout,
    });
  }

  /**
   * PUT request
   */
  static async put(url, data, options = {}) {
    return await axios.put(url, data, {
      ...options,
      timeout: this.timeout,
    });
  }

  /**
   * PATCH request
   */
  static async patch(url, data, options = {}) {
    return await axios.patch(url, data, {
      ...options,
      timeout: this.timeout,
    });
  }

  /**
   * DELETE request
   */
  static async delete(url, options = {}) {
    return await axios.delete(url, {
      ...options,
      timeout: this.timeout,
    });
  }
}

module.exports = { ApiClient };
