/**
 * User model representing an authenticated user in the consent management system.
 */
export interface User {
  /** Unique user identifier from Google Cloud Identity Platform */
  uid: string;
  
  /** User's email address */
  email: string;
  
  /** ID token for authentication */
  idToken: string;
  
  /** Whether the user has completed KBA verification */
  kbaVerified?: boolean;
  
  /** Timestamp of when the user was created */
  createdAt?: Date;
}

/**
 * KBA (Knowledge-Based Authentication) data for identity verification.
 */
export interface KBAData {
  /** Last 4 digits of Social Security Number */
  ssnLast4: string;
  
  /** Date of birth in YYYY-MM-DD format */
  dob: string;
}

/**
 * Response from KBA verification endpoint.
 */
export interface KBAVerificationResponse {
  /** Whether verification was successful */
  verified: boolean;
  
  /** Status message */
  status: string;
  
  /** Optional error or info message */
  message?: string;
}
