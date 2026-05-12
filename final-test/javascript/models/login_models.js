/**
 * Models for login Collection
 */

/**
 * Request body for createAccount
 */
class CreateAccountBody {
  constructor({
    userId,
    summaryRef,
    noteContent,
  } = {}) {
    this.userId = userId;
    this.summaryRef = summaryRef;
    this.noteContent = noteContent;
  }

  toJSON() {
    return {
      user_id: this.userId,
      summaryRef: this.summaryRef,
      note_content: this.noteContent,
    };
  }
}

/**
 * Headers for createAccount
 */
class CreateAccountHeaders {
  constructor({
  } = {}) {
  }

  toObject() {
    const headers = {};
    return headers;
  }
}

/**
 * Response for createAccount
 */
class CreateAccountResponse {
  constructor(data) {
    this.data = data;
  }

  static fromJSON(json) {
    return new CreateAccountResponse(json);
  }

  toJSON() {
    return this.data;
  }
}


module.exports = {
  CreateAccountBody,
  CreateAccountHeaders,
  CreateAccountResponse,
};
