import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import { signInWithCustomToken } from 'firebase/auth';
import { kbaService } from '../../services/kba.service';
import { apiClient } from '../../services/api.client';
import { useApiActivityLogger } from '../../hooks/useApiActivityLogger';
import { auth } from '../../config/firebase.config';

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
  
  /** Selected test person from Demo Control Panel */
  selectedTestPerson?: any;
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
  isLoading = false,
  selectedTestPerson
}: KBAVerificationProps): React.ReactElement {
  const [ssnLast4, setSsnLast4] = useState('');
  const [dob, setDob] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [ssnError, setSsnError] = useState('');
  const [dobError, setDobError] = useState('');
  const [zipError, setZipError] = useState('');
  const [streetError, setStreetError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logKBARequest, logKBASuccess, logKBAFailure, logAuthToken, logAuthSuccess } = useApiActivityLogger();

  // Auto-fill form when test person is selected
  useEffect(() => {
    if (selectedTestPerson) {
      setSsnLast4(selectedTestPerson.ssn_last_4 || '');
      setDob(selectedTestPerson.date_of_birth || '');
      setZipCode(selectedTestPerson.address?.zip || '');
      setStreet(selectedTestPerson.address?.street || '');
      setSsnError('');
      setDobError('');
      setZipError('');
      setStreetError('');
    }
  }, [selectedTestPerson]);

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Count how many fields are provided
    const fieldsProvided = [ssnLast4, dob, zipCode, street].filter(f => f.trim()).length;
    
    if (fieldsProvided < 2) {
      onError('Please provide at least 2 fields for verification');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Build the request with all provided fields
      const medicaidId = selectedTestPerson?.medicaid_id;
      
      if (!medicaidId) {
        onError('Please select a test person from the Demo Control Panel first');
        setIsSubmitting(false);
        return;
      }
      
      const kbaData: any = {
        medicaid_id: medicaidId
      };
      
      if (ssnLast4) kbaData.ssn_last4 = ssnLast4;
      if (dob) kbaData.dob = dob;
      if (zipCode) kbaData.zip_code = zipCode;
      if (street) kbaData.street = street;
      
      console.log('Sending KBA data:', kbaData);
      
      // Log KBA request with fields being checked
      const fieldsChecked = [];
      if (ssnLast4) fieldsChecked.push('SSN');
      if (dob) fieldsChecked.push('DOB');
      if (zipCode) fieldsChecked.push('ZIP');
      if (street) fieldsChecked.push('Street');
      
      logKBARequest(kbaData.medicaid_id, fieldsChecked);
      
      const response = await kbaService.verifyIdentity(kbaData);
      
      if (response.verified && response.person) {
        // Log successful verification
        logKBASuccess(response.person, 2, 2);
        
        // Check if we got a custom token from the backend
        if (response.custom_token) {
          try {
            // Sign in with the custom token from Firebase
            logAuthToken(response.person.medicaid_id);
            
            const userCredential = await signInWithCustomToken(auth, response.custom_token);
            
            // Get the ID token for API calls
            const idToken = await userCredential.user.getIdToken();
            apiClient.setAuthToken(idToken);
            
            // Log authentication success
            logAuthSuccess(response.person);
            
            console.log('Signed in with Firebase custom token');
          } catch (firebaseError) {
            console.error('Firebase sign-in failed, falling back to mock token:', firebaseError);
            
            // Fallback to mock token if Firebase fails
            const token = `mock-token-${response.person.medicaid_id}`;
            apiClient.setAuthToken(token);
            logAuthToken(response.person.medicaid_id);
            logAuthSuccess(response.person);
          }
        } else {
          // Fallback to mock token if no custom token provided
          console.log('No custom token provided, using mock token');
          const token = `mock-token-${response.person.medicaid_id}`;
          apiClient.setAuthToken(token);
          logAuthToken(response.person.medicaid_id);
          logAuthSuccess(response.person);
        }
        
        onVerified();
      } else {
        // Log failed verification
        logKBAFailure(response.message || 'Verification failed', response.attempts_remaining);
        onError(response.message || 'Identity verification failed. Please check your information.');
      }
    } catch (error) {
      logKBAFailure('Verification error occurred');
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

  /**
   * Handles ZIP code input change.
   */
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
    
    if (zipError) {
      setZipError('');
    }
  };

  /**
   * Handles street address input change.
   */
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setStreet(value);
    
    if (streetError) {
      setStreetError('');
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
          Please provide at least 2 of the following fields to verify your identity (2-of-4 verification).
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField 
            fullWidth 
            label="Last 4 Digits of SSN (Optional)" 
            variant="outlined" 
            margin="normal"
            type="text"
            inputMode="numeric"
            value={ssnLast4} 
            onChange={handleSSNChange}
            error={!!ssnError}
            helperText={ssnError || 'Last 4 digits of your Social Security Number'}
            disabled={disabled}
            autoComplete="off"
            inputProps={{
              'aria-label': 'Last 4 digits of Social Security Number',
              'aria-invalid': !!ssnError,
              maxLength: 4,
              pattern: '[0-9]{4}',
            }}
          />
          
          <TextField 
            fullWidth 
            label="Date of Birth (Optional)" 
            variant="outlined" 
            margin="normal"
            type="date"
            value={dob} 
            onChange={handleDOBChange}
            error={!!dobError}
            helperText={dobError || 'Format: YYYY-MM-DD'}
            disabled={disabled}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              'aria-label': 'Date of birth',
              'aria-invalid': !!dobError,
            }}
          />
          
          <TextField 
            fullWidth 
            label="ZIP Code (Optional)" 
            variant="outlined" 
            margin="normal"
            type="text"
            inputMode="numeric"
            value={zipCode} 
            onChange={handleZipChange}
            error={!!zipError}
            helperText={zipError || '5-digit ZIP code'}
            disabled={disabled}
            autoComplete="postal-code"
            inputProps={{
              'aria-label': 'ZIP code',
              'aria-invalid': !!zipError,
              maxLength: 5,
              pattern: '[0-9]{5}',
            }}
          />
          
          <TextField 
            fullWidth 
            label="Street Address (Optional)" 
            variant="outlined" 
            margin="normal"
            type="text"
            value={street} 
            onChange={handleStreetChange}
            error={!!streetError}
            helperText={streetError || 'Street address (e.g., 123 Main St)'}
            disabled={disabled}
            autoComplete="street-address"
            inputProps={{
              'aria-label': 'Street address',
              'aria-invalid': !!streetError,
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
