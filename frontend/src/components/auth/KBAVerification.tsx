import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import { kbaService } from '../../services/kba.service';
import type { KBAData } from '../../models/User';

/**
 * Props for KBAVerification component.
 */
interface KBAVerificationProps {
  /** Callback when verification succeeds */
  onVerified: () => void;
  
  /** Callback when verification fails */
  onError: (error: string) => void;
  
  /** Whether verification is in progress */
  isLoading?: boolean;
}

/**
 * Knowledge-Based Authentication verification component.
 * Collects and validates SSN last 4 and date of birth.
 * 
 * @param props - Component props
 * @returns KBAVerification component
 */
export function KBAVerification({ 
  onVerified, 
  onError, 
  isLoading = false 
}: KBAVerificationProps): React.ReactElement {
  const [ssnLast4, setSsnLast4] = useState('');
  const [dob, setDob] = useState('');
  const [ssnError, setSsnError] = useState('');
  const [dobError, setDobError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates SSN last 4 input.
   */
  const validateSSN = (value: string): boolean => {
    if (!value) {
      setSsnError('SSN last 4 digits are required');
      return false;
    }
    
    if (!/^\d{4}$/.test(value)) {
      setSsnError('Must be exactly 4 digits');
      return false;
    }
    
    setSsnError('');
    return true;
  };

  /**
   * Validates date of birth input.
   */
  const validateDOB = (value: string): boolean => {
    if (!value) {
      setDobError('Date of birth is required');
      return false;
    }
    
    const validation = kbaService.validateKBAData({ ssnLast4: '0000', dob: value });
    if (!validation.valid) {
      setDobError(validation.error || 'Invalid date of birth');
      return false;
    }
    
    setDobError('');
    return true;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const ssnValid = validateSSN(ssnLast4);
    const dobValid = validateDOB(dob);
    
    if (!ssnValid || !dobValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const kbaData: KBAData = {
        ssnLast4,
        dob,
      };
      
      const response = await kbaService.verifyIdentity(kbaData);
      
      if (response.verified) {
        onVerified();
      } else {
        onError(response.message || 'Identity verification failed. Please check your information.');
      }
    } catch (error) {
      onError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles SSN input change.
   */
  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setSsnLast4(value);
    
    if (ssnError) {
      setSsnError('');
    }
  };

  /**
   * Handles DOB input change.
   */
  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setDob(value);
    
    if (dobError) {
      setDobError('');
    }
  };

  const disabled = isLoading || isSubmitting;

  return (
    <Card 
      sx={{ 
        maxWidth: 400, 
        mx: 'auto', 
        mt: { xs: 2, sm: 4 },
        width: '100%',
      }}
      component="section"
      aria-labelledby="kba-title"
    >
      <CardContent>
        <Typography 
          id="kba-title"
          variant="h5" 
          component="h2"
          gutterBottom
        >
          Verify Identity
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2 }}
        >
          For your security, please provide the following information to verify your identity.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField 
            fullWidth 
            label="Last 4 Digits of SSN" 
            variant="outlined" 
            margin="normal"
            type="text"
            inputMode="numeric"
            value={ssnLast4} 
            onChange={handleSSNChange}
            error={!!ssnError}
            helperText={ssnError || 'Enter the last 4 digits of your Social Security Number'}
            disabled={disabled}
            required
            autoComplete="off"
            inputProps={{
              'aria-label': 'Last 4 digits of Social Security Number',
              'aria-required': 'true',
              'aria-invalid': !!ssnError,
              maxLength: 4,
              pattern: '[0-9]{4}',
            }}
          />
          
          <TextField 
            fullWidth 
            label="Date of Birth" 
            variant="outlined" 
            margin="normal"
            type="date"
            value={dob} 
            onChange={handleDOBChange}
            error={!!dobError}
            helperText={dobError || 'Format: YYYY-MM-DD'}
            disabled={disabled}
            required
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              'aria-label': 'Date of birth',
              'aria-required': 'true',
              'aria-invalid': !!dobError,
            }}
          />
          
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            type="submit"
            disabled={disabled}
            aria-label="Verify your identity"
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
