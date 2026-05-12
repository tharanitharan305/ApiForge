import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/api_client.dart';
import '../core/api_response.dart';
import '../models/login_models.dart';

/// login Collection
/// 
/// Base Path: /auth
class Login {
  static final ApiClient _client = ApiClient();

  /// createAccount
  
  /// Endpoint: /auth/createAccount
  static Future<ApiResponse<CreateAccountResponse>> createAccount({
    required CreateAccountBody body,
    CreateAccountHeaders? headers,
  }) async {
    final url = _client.buildUrl(
      '/auth/createAccount',
      queryParams: {
      },
    );

    final requestHeaders = <String, String>{
      'Content-Type': 'application/json',
      ...?headers?.toMap(),
    };

falsetruefalsefalsefalse
    return ApiResponse<CreateAccountResponse>.fromResponse(
      response,
      (data) => CreateAccountResponse.fromJson(data as Map<String, dynamic>),
    );
  }

}
