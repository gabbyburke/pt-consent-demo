import { apiClient } from './api.client';
import type { ProviderWithConsent } from '../models/Provider';
import type { UpdateConsentRequest, ConsentResponse } from '../models/ConsentRecord';

/**
 * Response from the consents endpoint.
 */
interface ConsentsResponse {
  providers: ProviderWithConsent[];
}

/**
 * Consent management service.
 * Handles fetching and updating user consent preferences.
 */
class ConsentService {
  /**
   * Fetches all providers with their consent status for the current user.
   * 
   * @returns Promise resolving to array of providers with consent status
   * @throws ApiError if the request fails
   */
  async getConsents(): Promise<ProviderWithConsent[]> {
    try {
      const response = await apiClient.get<ConsentsResponse>('/consents');
      return response.providers;
    } catch (error) {
      console.error('Failed to fetch consents:', error);
      throw error;
    }
  }

  /**
   * Updates consent for a specific provider.
   * 
   * @param request - Update consent request data
   * @returns Promise resolving to the consent response
   * @throws ApiError if the update fails
   */
  async updateConsent(request: UpdateConsentRequest): Promise<ConsentResponse> {
    try {
      const response = await apiClient.post<ConsentResponse>('/consents', request);
      return response;
    } catch (error) {
      console.error('Failed to update consent:', error);
      throw error;
    }
  }

  /**
   * Updates consent for multiple providers at once.
   * Useful for "grant all" or "revoke all" operations.
   * 
   * @param providerIds - Array of provider IDs to update
   * @param consented - New consent status
   * @returns Promise resolving to array of consent responses
   */
  async updateMultipleConsents(
    providerIds: string[],
    consented: boolean
  ): Promise<ConsentResponse[]> {
    try {
      const promises = providerIds.map((providerId) =>
        this.updateConsent({ providerId, consented })
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Failed to update multiple consents:', error);
      throw error;
    }
  }

  /**
   * Toggles consent for a specific provider.
   * 
   * @param providerId - Provider ID to toggle
   * @param currentStatus - Current consent status
   * @returns Promise resolving to the consent response
   */
  async toggleConsent(
    providerId: string,
    currentStatus: boolean
  ): Promise<ConsentResponse> {
    try {
      const response = await apiClient.post<ConsentResponse>('/consents/toggle', {
        provider_id: providerId,
        consented: !currentStatus,
      });
      return response;
    } catch (error) {
      console.error('Failed to toggle consent:', error);
      throw error;
    }
  }

  /**
   * Revokes all consents for the current user.
   * 
   * @param providerIds - Array of all provider IDs
   * @returns Promise resolving to the response
   */
  async revokeAllConsents(providerIds: string[]): Promise<ConsentResponse> {
    try {
      const response = await apiClient.post<ConsentResponse>('/consents/revoke-all', {
        provider_ids: providerIds,
      });
      return response;
    } catch (error) {
      console.error('Failed to revoke all consents:', error);
      throw error;
    }
  }

  /**
   * Grants consent to all providers for the current user.
   * 
   * @param providerIds - Array of all provider IDs
   * @returns Promise resolving to the response
   */
  async grantAllConsents(providerIds: string[]): Promise<ConsentResponse> {
    try {
      const response = await apiClient.post<ConsentResponse>('/consents/grant-all', {
        provider_ids: providerIds,
      });
      return response;
    } catch (error) {
      console.error('Failed to grant all consents:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const consentService = new ConsentService();
