import type { DataType } from './Provider';

/**
 * Consent record representing a user's consent decision for a specific provider.
 */
export interface ConsentRecord {
  /** Unique consent record identifier */
  id: string;
  
  /** User ID who owns this consent */
  userId: string;
  
  /** Provider ID this consent applies to */
  providerId: string;
  
  /** Whether consent is granted */
  consented: boolean;
  
  /** Specific data types consented (for granular control) */
  dataTypes?: DataType[];
  
  /** Optional expiration date for the consent */
  expirationDate?: Date;
  
  /** When the consent was created */
  createdAt: Date;
  
  /** When the consent was last updated */
  updatedAt: Date;
}

/**
 * Request payload for updating consent.
 */
export interface UpdateConsentRequest {
  /** Provider ID to update consent for */
  providerId: string;
  
  /** New consent status */
  consented: boolean;
  
  /** Optional data types to consent to */
  dataTypes?: DataType[];
  
  /** Optional expiration date */
  expirationDate?: Date;
}

/**
 * Response from consent operations.
 */
export interface ConsentResponse {
  /** Status of the operation */
  status: string;
  
  /** Optional message */
  message?: string;
  
  /** Updated consent record */
  consent?: ConsentRecord;
}
