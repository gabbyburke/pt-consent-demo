import React from 'react';
import { Card, CardContent, List, ListItem, ListItemText, ListItemSecondaryAction, Switch } from '@mui/material';

/**
 * Props for GlobalConsentToggle component.
 */
interface GlobalConsentToggleProps {
  /** Whether all providers are consented */
  allConsented: boolean;
  
  /** Callback when global consent is toggled */
  onToggle: (checked: boolean) => void;
  
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

/**
 * Global consent toggle component.
 * Allows users to grant or revoke consent for all providers at once.
 * 
 * @param props - Component props
 * @returns GlobalConsentToggle component
 */
export function GlobalConsentToggle({ 
  allConsented, 
  onToggle, 
  disabled = false 
}: GlobalConsentToggleProps): React.ReactElement {
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onToggle(event.target.checked);
  };

  return (
    <Card 
      sx={{ mb: 3 }}
      component="section"
      aria-labelledby="global-consent-title"
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <List>
          <ListItem
            sx={{
              py: 2,
              backgroundColor: 'action.hover',
            }}
          >
            <ListItemText 
              id="global-consent-title"
              primary="Global Consent Control" 
              secondary="Grant or revoke consent for all healthcare providers" 
              primaryTypographyProps={{ 
                fontWeight: 'bold',
                component: 'h2',
                variant: 'body1',
              }}
              secondaryTypographyProps={{
                component: 'p',
              }}
            />
            
            <ListItemSecondaryAction>
              <Switch 
                edge="end"
                checked={allConsented}
                onChange={handleToggle}
                disabled={disabled}
                inputProps={{ 
                  'aria-labelledby': 'global-consent-title',
                  'aria-label': allConsented 
                    ? 'Revoke consent for all providers' 
                    : 'Grant consent to all providers',
                }}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
