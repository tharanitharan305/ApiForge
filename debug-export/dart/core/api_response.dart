import 'dart:convert';
import 'package:http/http.dart' as http;

/// Normalized API Response
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final int? statusCode;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.statusCode,
  });

  /// Create ApiResponse from HTTP response
  static ApiResponse<T> fromResponse<T>(
    http.Response response,
    T Function(dynamic)? dataParser,
  ) {
    try {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      
      // Extract fields based on response mapping
      final success = json['success'] as bool? ?? (response.statusCode >= 200 && response.statusCode < 300);
      final message = json['message'] as String? ?? '';
      final rawData = json['data'];
      final statusCode = json['statusCode'] as int? ?? response.statusCode;

      T? parsedData;
      if (rawData != null && dataParser != null) {
        parsedData = dataParser(rawData);
      }

      return ApiResponse<T>(
        success: success,
        message: message,
        data: parsedData,
        statusCode: statusCode,
      );
    } catch (e) {
      return ApiResponse<T>(
        success: false,
        message: 'Failed to parse response: $e',
        statusCode: response.statusCode,
      );
    }
  }

  @override
  String toString() {
    return 'ApiResponse(success: $success, message: $message, data: $data, statusCode: $statusCode)';
  }
}
