import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { GlobalConsentToggle } from './GlobalConsentToggle';
import { ProviderList } from './ProviderList';
import { consentService } from '../../services/consent.service';
import type { ProviderWithConsent } from '../../models/Provider';
import { useApiActivityLogger } from '../../hooks/useApiActivityLogger';

/**
 * Props for ConsentDashboard component.
 */
interface ConsentDashboardProps {
  /** Callback when an error occurs */
  onError: (error: string) => void;
  
  /** Callback when a success message should be shown */
  onSuccess?: (message: string) => void;
}

/**
 * Consent dashboard component.
 * Main interface for managing healthcare provider consent preferences.
 * 
 * @param props - Component props
 * @returns ConsentDashboard component
 */
export function ConsentDashboard({ 
  onError, 
  onSuccess 
}: ConsentDashboardProps): React.ReactElement {
  const [providers, setProviders] = useState<ProviderWithConsent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { logConsentUpdate, logApiRequest, logApiResponse } = useApiActivityLogger();

  /**
   * Fetches consent data from the backend.
   */
  const fetchConsents = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await consentService.getConsents();
      setProviders(data);
    } catch (error) {
      console.error('Failed to fetch consents:', error);
      onError('Failed to load consent data. Please try again.');
      
      // Fallback to mock data for development
      setProviders([
        { 
          id: 'p1', 
          name: 'Denver Health', 
          address: '777 Bannock St, Denver, CO 80204',
          consented: true 
        },
        { 
          id: 'p2', 
          name: 'UCHealth', 
          address: '1635 Aurora Court, Aurora, CO 80045',
          consented: false 
        },
        { 
          id: 'p3', 
          name: 'Children\'s Hospital Colorado', 
          address: '13123 E 16th Ave, Aurora, CO 80045',
          consented: true 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggles consent for a single provider.
   */
  const handleToggleConsent = async (providerId: string, currentStatus: boolean): Promise<void> => {
    setIsUpdating(true);
    
    // Save original state for potential revert
    const originalProviders = [...providers];
    
    // Find provider name for logging
    const provider = providers.find(p => p.id === providerId);
    const providerName = provider?.name || providerId;
    const newStatus = !currentStatus;
    
    // Optimistic update
    const updatedProviders = providers.map(p =>
      p.id === providerId ? { ...p, consented: newStatus } : p
    );
    setProviders(updatedProviders);

    try {
      // Log the API request
      logApiRequest('POST', '/api/consents/toggle', {
        provider_id: providerId,
        consented: newStatus,
      });
      
      const startTime = Date.now();
      await consentService.toggleConsent(providerId, currentStatus);
      const duration = Date.now() - startTime;
      
      // Log successful API response
      logApiResponse('POST', '/api/consents/toggle', 200, { success: true }, duration);
      
      // Log the consent update to timeline
      logConsentUpdate(
        providerName,
        newStatus ? 'GRANTED' : 'REVOKED',
        false
      );
      
      onSuccess?.(`Consent ${newStatus ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Failed to update consent:', error);
      
      // Log failed API response
      logApiResponse('POST', '/api/consents/toggle', 500, { error: 'Failed to update consent' });
      
      onError('Failed to update consent. Please try again.');
      
      // Revert to original state on error
      setProviders(originalProviders);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Toggles consent for all providers.
   */
  const handleToggleAll = async (checked: boolean): Promise<void> => {
    setIsUpdating(true);
    
    // Save original state for potential revert
    const originalProviders = [...providers];
    
    // Optimistic update
    const updatedProviders = providers.map(p => ({ ...p, consented: checked }));
    setProviders(updatedProviders);

    try {
      const providerIds = providers.map(p => p.id);
      const endpoint = checked ? '/api/consents/grant-all' : '/api/consents/revoke-all';
      
      // Log the API request
      logApiRequest('POST', endpoint, { provider_ids: providerIds });
      
      const startTime = Date.now();
      if (checked) {
        await consentService.grantAllConsents(providerIds);
      } else {
        await consentService.revokeAllConsents(providerIds);
      }
      const duration = Date.now() - startTime;
      
      // Log successful API response
      logApiResponse('POST', endpoint, 200, { success: true, count: providerIds.length }, duration);
      
      // Log the global consent update to timeline
      logConsentUpdate(
        `All Providers (${providers.length})`,
        checked ? 'GRANTED' : 'REVOKED',
        true
      );
      
      onSuccess?.(`Consent ${checked ? 'granted' : 'revoked'} for all providers`);
    } catch (error) {
      console.error('Failed to update all consents:', error);
      
      // Log failed API response
      const endpoint = checked ? '/api/consents/grant-all' : '/api/consents/revoke-all';
      logApiResponse('POST', endpoint, 500, { error: 'Failed to update consents' });
      
      onError('Failed to update consents. Please try again.');
      
      // Revert to original state on error
      setProviders(originalProviders);
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch consents on mount
  useEffect(() => {
    fetchConsents();
  }, []);

  // Calculate if all providers are consented
  const allConsented = providers.length > 0 && providers.every(p => p.consented);

  return (
    <Box sx={{ mt: { xs: 2, sm: 4 } }}>
      <Typography 
        variant="h4" 
        component="h1"
        gutterBottom
        sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
      >
        Consent Management
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        Manage which healthcare providers can access your personal health information.
      </Typography>

      <GlobalConsentToggle
        allConsented={allConsented}
        onToggle={handleToggleAll}
        disabled={isUpdating || isLoading}
      />

      <ProviderList
        providers={providers}
        onToggleConsent={handleToggleConsent}
        isLoading={isLoading}
        disabled={isUpdating}
      />
    </Box>
  );
}
