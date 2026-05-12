/**
 * Normalized API Response
 */
class ApiResponse {
  constructor({ success, message, data, statusCode }) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  toString() {
    return `ApiResponse(success: ${this.success}, message: ${this.message}, statusCode: ${this.statusCode})`;
  }
}

/**
 * Normalize axios response to ApiResponse format
 */
function normalizeResponse(response) {
  try {
    const data = response.data;
    
    // Extract fields based on response mapping
    const success = data.success !== undefined 
      ? data.success 
      : (response.status >= 200 && response.status < 300);
    const message = data.message || '';
    const responseData = data.data !== undefined ? data.data : data;
    const statusCode = data.statusCode || response.status;

    return new ApiResponse({
      success,
      message,
      data: responseData,
      statusCode,
    });
  } catch (error) {
    return new ApiResponse({
      success: false,
      message: `Failed to parse response: ${error.message}`,
      data: null,
      statusCode: response.status,
    });
  }
}

module.exports = { ApiResponse, normalizeResponse };
