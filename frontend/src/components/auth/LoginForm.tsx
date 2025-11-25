import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';

/**
 * Props for LoginForm component.
 */
interface LoginFormProps {
  /** Callback when user submits login */
  onLogin: (email: string) => void;
  
  /** Callback for development bypass */
  onBypass?: () => void;
  
  /** Whether login is in progress */
  isLoading?: boolean;
}

/**
 * Login form component.
 * Provides email input and mock authentication for development.
 * 
 * @param props - Component props
 * @returns LoginForm component
 */
export function LoginForm({ onLogin, onBypass, isLoading = false }: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  /**
   * Validates email format.
   */
  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('Email address is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (validateEmail(email)) {
      onLogin(email);
    }
  };

  /**
   * Handles email input change.
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 400, 
        mx: 'auto', 
        mt: { xs: 2, sm: 4 },
        width: '100%',
      }}
      component="section"
      aria-labelledby="login-title"
    >
      <CardContent>
        <Typography 
          id="login-title"
          variant="h5" 
          component="h2"
          gutterBottom
        >
          Sign In
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2 }}
        >
          Secure access to manage your healthcare data consent preferences
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField 
            fullWidth 
            label="Email Address" 
            variant="outlined" 
            margin="normal"
            type="email"
            value={email} 
            onChange={handleEmailChange}
            error={!!emailError}
            helperText={emailError}
            disabled={isLoading}
            required
            autoComplete="email"
            inputProps={{
              'aria-label': 'Email address',
              'aria-required': 'true',
              'aria-invalid': !!emailError,
              'aria-describedby': emailError ? 'email-error' : undefined,
            }}
          />
          
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            type="submit"
            disabled={isLoading}
            aria-label="Sign in with email"
          >
            {isLoading ? 'Signing in...' : 'Login (Mock)'}
          </Button>
          
          {onBypass && (
            <Button 
              fullWidth 
              variant="outlined" 
              color="secondary" 
              sx={{ mt: 1 }}
              onClick={onBypass}
              disabled={isLoading}
              aria-label="Skip authentication for development testing"
            >
              Skip to Dashboard (Dev)
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
