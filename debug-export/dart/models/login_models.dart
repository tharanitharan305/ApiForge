/// Models for login Collection

/// Request body for createAccount
class CreateAccountBody {
  final String userId;
  final String summaryRef;
  final String noteContent;

  CreateAccountBody({
    required this.userId,
    required this.summaryRef,
    required this.noteContent,
  });

  Map<String, dynamic> toJson() => {
    'user_id': userId,
    'summaryRef': summaryRef,
    'note_content': noteContent,
  };
}

/// Headers for createAccount
class CreateAccountHeaders {

  CreateAccountHeaders({
  });

  Map<String, String> toMap() => {
  };
}

/// Response for createAccount
class CreateAccountResponse {
  final Map<String, dynamic> data;

  CreateAccountResponse(this.data);

  factory CreateAccountResponse.fromJson(Map<String, dynamic> json) {
    return CreateAccountResponse(json);
  }

  Map<String, dynamic> toJson() => data;
}

