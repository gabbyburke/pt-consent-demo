import React from 'react';
import { Card, CardContent, List, Typography, Box, CircularProgress } from '@mui/material';
import { ProviderListItem } from './ProviderListItem';
import type { ProviderWithConsent } from '../../models/Provider';

/**
 * Props for ProviderList component.
 */
interface ProviderListProps {
  /** Array of providers with consent status */
  providers: ProviderWithConsent[];
  
  /** Callback when a provider's consent is toggled */
  onToggleConsent: (providerId: string, currentStatus: boolean) => void;
  
  /** Whether the list is in a loading state */
  isLoading?: boolean;
  
  /** Whether all toggles are disabled */
  disabled?: boolean;
}

/**
 * Provider list component.
 * Displays a list of healthcare providers with consent toggles.
 * 
 * @param props - Component props
 * @returns ProviderList component
 */
export function ProviderList({ 
  providers, 
  onToggleConsent, 
  isLoading = false,
  disabled = false 
}: ProviderListProps): React.ReactElement {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={200}
          >
            <CircularProgress aria-label="Loading providers" />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (providers.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight={200}
          >
            <Typography 
              variant="body1" 
              color="text.secondary"
              role="status"
            >
              No healthcare providers found
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      component="section"
      aria-labelledby="provider-list-title"
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography 
            id="provider-list-title"
            variant="h6" 
            component="h2"
            gutterBottom
          >
            Healthcare Providers
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            Manage consent for individual providers below
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
          {providers.map((provider, index) => (
            <ProviderListItem
              key={provider.id}
              provider={provider}
              onToggle={onToggleConsent}
              disabled={disabled}
              divider={index < providers.length - 1}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
