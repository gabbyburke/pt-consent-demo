import { apiClient } from './api.client';
import type { KBAData, KBAVerificationResponse } from '../models/User';

/**
 * Knowledge-Based Authentication (KBA) service.
 * Handles identity verification using SSN last 4 and date of birth.
 */
class KBAService {
  /**
   * Submits KBA challenge data for verification.
   * 
   * @param kbaData - KBA data containing any combination of fields (medicaid_id, ssn_last4, dob, zip_code, street)
   * @returns Promise resolving to verification response
   * @throws ApiError if verification fails
   */
  async verifyIdentity(kbaData: any): Promise<KBAVerificationResponse> {
    try {
      // Send the data as-is - the component already built it correctly
      const response = await apiClient.post<KBAVerificationResponse>(
        '/kba-challenge',
        kbaData
      );

      return response;
    } catch (error) {
      console.error('KBA verification failed:', error);
      throw error;
    }
  }

  /**
   * Validates KBA input data before submission.
   * 
   * @param kbaData - KBA data to validate
   * @returns Object with validation result and error message if invalid
   */
  validateKBAData(kbaData: KBAData): { valid: boolean; error?: string } {
    // Validate SSN last 4
    if (!kbaData.ssnLast4 || kbaData.ssnLast4.length !== 4) {
      return {
        valid: false,
        error: 'SSN last 4 digits must be exactly 4 digits',
      };
    }

    if (!/^\d{4}$/.test(kbaData.ssnLast4)) {
      return {
        valid: false,
        error: 'SSN last 4 digits must contain only numbers',
      };
    }

    // Validate date of birth
    if (!kbaData.dob) {
      return {
        valid: false,
        error: 'Date of birth is required',
      };
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(kbaData.dob)) {
      return {
        valid: false,
        error: 'Date of birth must be in YYYY-MM-DD format',
      };
    }

    // Validate that it's a valid date
    const date = new Date(kbaData.dob);
    if (isNaN(date.getTime())) {
      return {
        valid: false,
        error: 'Invalid date of birth',
      };
    }

    // Validate that date is in the past
    if (date > new Date()) {
      return {
        valid: false,
        error: 'Date of birth cannot be in the future',
      };
    }

    // Validate reasonable age range (e.g., not more than 120 years old)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (date < minDate) {
      return {
        valid: false,
        error: 'Date of birth is too far in the past',
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const kbaService = new KBAService();
