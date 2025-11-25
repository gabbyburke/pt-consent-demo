import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, Switch } from '@mui/material';
import type { ProviderWithConsent } from '../../models/Provider';

/**
 * Props for ProviderListItem component.
 */
interface ProviderListItemProps {
  /** Provider data with consent status */
  provider: ProviderWithConsent;
  
  /** Callback when consent is toggled */
  onToggle: (providerId: string, currentStatus: boolean) => void;
  
  /** Whether the item is disabled */
  disabled?: boolean;
  
  /** Whether to show a divider */
  divider?: boolean;
}

/**
 * Individual provider list item component.
 * Displays provider name and consent toggle switch.
 * 
 * @param props - Component props
 * @returns ProviderListItem component
 */
export function ProviderListItem({ 
  provider, 
  onToggle, 
  disabled = false,
  divider = false 
}: ProviderListItemProps): React.ReactElement {
  const handleToggle = (): void => {
    onToggle(provider.id, provider.consented);
  };

  const switchId = `consent-switch-${provider.id}`;
  const labelId = `consent-label-${provider.id}`;

  return (
    <ListItem 
      divider={divider}
      sx={{
        py: 2,
        px: { xs: 2, sm: 3 },
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemText 
        id={labelId}
        primary={provider.name}
        primaryTypographyProps={{
          component: 'span',
          fontWeight: 500,
          fontSize: { xs: '0.95rem', sm: '1rem' },
        }}
        secondary={
          <>
            {provider.address && (
              <span style={{ display: 'block', marginBottom: '4px' }}>
                {provider.address}
              </span>
            )}
            <span style={{ 
              color: provider.consented ? '#2e7d32' : undefined,
              fontWeight: provider.consented ? 500 : 400,
            }}>
              {provider.consented ? 'Data sharing enabled' : 'Data sharing disabled'}
            </span>
          </>
        }
        secondaryTypographyProps={{
          component: 'span',
        }}
      />
      
      <ListItemSecondaryAction>
        <Switch 
          id={switchId}
          edge="end"
          checked={provider.consented}
          onChange={handleToggle}
          disabled={disabled}
          inputProps={{ 
            'aria-labelledby': labelId,
            'aria-label': `${provider.consented ? 'Revoke' : 'Grant'} consent for ${provider.name}`,
          }}
          color="primary"
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
}
