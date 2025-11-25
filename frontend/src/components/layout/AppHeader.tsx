import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

/**
 * Props for AppHeader component.
 */
interface AppHeaderProps {
  /** Whether a user is currently logged in */
  isAuthenticated: boolean;
  
  /** User's email address (if authenticated) */
  userEmail?: string;
  
  /** Callback for logout action */
  onLogout: () => void;
}

/**
 * Application header component.
 * Displays the app title and logout button when authenticated.
 * 
 * @param props - Component props
 * @returns AppHeader component
 */
export function AppHeader({ isAuthenticated, userEmail, onLogout }: AppHeaderProps): React.ReactElement {
  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0} 
      sx={{ borderBottom: '1px solid #dadce0' }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ 
            flexGrow: 1, 
            color: 'text.secondary', 
            fontWeight: 500,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Colorado Consent Management
        </Typography>
        
        {isAuthenticated && (
          <>
            {userEmail && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: 2, 
                  color: 'text.secondary',
                  display: { xs: 'none', sm: 'block' },
                }}
                aria-label="Current user email"
              >
                {userEmail}
              </Typography>
            )}
            <Button 
              color="primary" 
              onClick={onLogout}
              aria-label="Sign out of your account"
              size="small"
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
