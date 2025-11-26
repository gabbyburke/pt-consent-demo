export enum ProviderType {
  SOCIAL = 'Social',
  BEHAVIORAL = 'Behavioral',
  PHYSICAL = 'Physical',
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  address: string;
  logoUrl: string;
}

export interface SharingPreference {
  providerId: string;
  canShare: boolean;
}

export interface PatientAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Patient {
  id:string;
  name: string;
  dob: string;
  ssnLast4: string;
  address: PatientAddress;
  medicaidId: string;
  sharingPreferences: SharingPreference[];
}

export interface AccessLog {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  date: string;
  dataTypesShared: string[];
}

// Types for Identity Verification
export type VerificationPayload = {
  fullName: string;
  dob: string;
  ssnLast4: string;
  address: string;
  medicaidId: string;
};

export type VerificationResult = 
  | { status: 'perfect_match'; patient: Patient }
  | { status: 'no_match' };

// Fix: Add missing VerificationField type export.
export type VerificationField = keyof Omit<VerificationPayload, 'fullName'>;