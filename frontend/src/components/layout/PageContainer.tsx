import React from 'react';
import { Container, Alert, Box } from '@mui/material';

/**
 * Props for PageContainer component.
 */
interface PageContainerProps {
  /** Child components to render */
  children: React.ReactNode;
  
  /** Optional error message to display */
  error?: string;
  
  /** Optional info message to display */
  info?: string;
  
  /** Optional success message to display */
  success?: string;
  
  /** Maximum width of the container */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Page container component with consistent layout and message display.
 * Provides a centered container with optional alert messages.
 * 
 * @param props - Component props
 * @returns PageContainer component
 */
export function PageContainer({ 
  children, 
  error, 
  info, 
  success,
  maxWidth = 'lg' 
}: PageContainerProps): React.ReactElement {
  return (
    <Container 
      maxWidth={maxWidth}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        width: '100%',
      }}
    >
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </Alert>
      )}
      
      {/* Info Alert */}
      {info && (
        <Alert 
          severity="info" 
          sx={{ mt: 2 }}
          role="status"
          aria-live="polite"
        >
          {info}
        </Alert>
      )}
      
      {/* Success Alert */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mt: 2 }}
          role="status"
          aria-live="polite"
        >
          {success}
        </Alert>
      )}
      
      {/* Main Content */}
      <Box component="main" role="main">
        {children}
      </Box>
    </Container>
  );
}
