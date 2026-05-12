/**
 * Models for login Collection
 */

/**
 * Request body for createAccount
 */
export interface CreateAccountBody {
  userId: string;
  summaryRef: string;
  noteContent: string;
}

/**
 * Headers for createAccount
 */
export interface CreateAccountHeaders {
}

/**
 * Response for createAccount
 */
export interface CreateAccountResponse {
  [key: string]: any;
}

