import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { GlobalConsentToggle } from './GlobalConsentToggle';
import { ProviderList } from './ProviderList';
import { consentService } from '../../services/consent.service';
import type { ProviderWithConsent } from '../../models/Provider';

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
    
    // Optimistic update
    const updatedProviders = providers.map(p =>
      p.id === providerId ? { ...p, consented: !currentStatus } : p
    );
    setProviders(updatedProviders);

    try {
      await consentService.toggleConsent(providerId, currentStatus);
      onSuccess?.(`Consent ${!currentStatus ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Failed to update consent:', error);
      onError('Failed to update consent. Please try again.');
      
      // Revert on error
      setProviders(providers);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Toggles consent for all providers.
   */
  const handleToggleAll = async (checked: boolean): Promise<void> => {
    setIsUpdating(true);
    
    // Optimistic update
    const updatedProviders = providers.map(p => ({ ...p, consented: checked }));
    setProviders(updatedProviders);

    try {
      const providerIds = providers.map(p => p.id);
      if (checked) {
        await consentService.grantAllConsents(providerIds);
      } else {
        await consentService.revokeAllConsents(providerIds);
      }
      onSuccess?.(`Consent ${checked ? 'granted' : 'revoked'} for all providers`);
    } catch (error) {
      console.error('Failed to update all consents:', error);
      onError('Failed to update consents. Please try again.');
      
      // Revert on error
      setProviders(providers);
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
