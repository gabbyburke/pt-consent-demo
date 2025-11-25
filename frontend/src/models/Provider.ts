/**
 * Provider type constants for categorizing healthcare providers.
 */
export const ProviderType = {
  HEALTHCARE: 'healthcare',
  BEHAVIORAL_HEALTH: 'behavioral_health',
  SOCIAL_CARE: 'social_care',
} as const;

export type ProviderType = typeof ProviderType[keyof typeof ProviderType];

/**
 * Data type constants for granular consent control.
 */
export const DataType = {
  MEDICAL_RECORDS: 'medical_records',
  LAB_RESULTS: 'lab_results',
  PRESCRIPTIONS: 'prescriptions',
  BEHAVIORAL_HEALTH: 'behavioral_health',
  SUBSTANCE_USE_DISORDER: 'substance_use_disorder',
  SOCIAL_SERVICES: 'social_services',
} as const;

export type DataType = typeof DataType[keyof typeof DataType];

/**
 * Provider model representing a healthcare organization or individual provider.
 */
export interface Provider {
  /** Unique provider identifier */
  id: string;
  
  /** Provider name (e.g., "Denver Health", "Dr. Smith") */
  name: string;
  
  /** Provider address for identification */
  address?: string;
  
  /** Type of provider */
  type?: ProviderType;
  
  /** Whether the provider is currently active */
  active?: boolean;
  
  /** Additional provider metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Extended provider with consent status for display purposes.
 */
export interface ProviderWithConsent extends Provider {
  /** Whether user has consented to share data with this provider */
  consented: boolean;
  
  /** Specific data types consented (for future granular control) */
  dataTypes?: DataType[];
  
  /** Optional expiration date for the consent */
  expirationDate?: Date;
}
