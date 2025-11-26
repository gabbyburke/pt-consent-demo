import React, { useState } from 'react';
import { Box, Grid, Container } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppHeader } from './components/layout/AppHeader';
import { PageContainer } from './components/layout/PageContainer';
import { LoginForm } from './components/auth/LoginForm';
import { KBAVerification } from './components/auth/KBAVerification';
import { ConsentDashboard } from './components/consent/ConsentDashboard';
import { DemoControlPanel } from './components/demo/DemoControlPanel';
import { ActivityTimeline } from './components/demo/ActivityTimeline';

/**
 * Main application content component.
 * Handles routing between login, KBA, and dashboard views.
 */
function AppContent(): React.ReactElement {
  const { user, kbaVerified, signIn, signOut, setKbaVerified } = useAuth();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTestPerson, setSelectedTestPerson] = useState<any>(null);

  /**
   * Handles user login.
   */
  const handleLogin = (email: string): void => {
    try {
      signIn(email);
      setInfo('Authentication successful. Please verify your identity.');
      setError('');
      setSuccess('');
    } catch (err) {
      setError('Login failed. Please try again.');
      setInfo('');
      setSuccess('');
    }
  };

  /**
   * Handles development bypass (skip auth and KBA).
   */
  const handleBypass = async (): Promise<void> => {
    try {
      signIn();
      setKbaVerified(true);
      setError('');
      setInfo('');
      setSuccess('');
    } catch (err) {
      setError('Bypass failed. Please try again.');
    }
  };

  /**
   * Handles successful KBA verification.
   */
  const handleKBAVerified = (): void => {
    setKbaVerified(true);
    setSuccess('Identity verified successfully!');
    setError('');
    setInfo('');
  };

  /**
   * Handles KBA verification error.
   */
  const handleKBAError = (errorMessage: string): void => {
    setError(errorMessage);
    setInfo('');
    setSuccess('');
  };

  /**
   * Handles logout.
   */
  const handleLogout = (): void => {
    signOut();
    setError('');
    setInfo('');
    setSuccess('');
  };

  /**
   * Handles consent dashboard errors.
   */
  const handleConsentError = (errorMessage: string): void => {
    setError(errorMessage);
    setInfo('');
    setSuccess('');
  };

  /**
   * Handles consent dashboard success messages.
   */
  const handleConsentSuccess = (successMessage: string): void => {
    setSuccess(successMessage);
    setError('');
    setInfo('');
  };

  /**
   * Handles selection of a test person from Demo Control Panel.
   */
  const handleSelectTestPerson = (person: any): void => {
    setSelectedTestPerson(person);
    setInfo(`Selected test user: ${person.first_name} ${person.last_name}. Use their credentials below.`);
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%',
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <AppHeader
        isAuthenticated={!!user}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <Container maxWidth={false} sx={{ flex: 1, py: 3 }}>
        {/* Demo Control Panel - Always visible at top */}
        <DemoControlPanel onSelectPerson={handleSelectTestPerson} />

        {/* Split-screen layout: Main content + Activity Timeline */}
        <Grid container spacing={2} sx={{ mt: 0 }}>
          {/* Main Content Area */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <PageContainer
              error={error}
              info={info}
              success={success}
            >
              {!user && (
                <LoginForm
                  onLogin={handleLogin}
                  onBypass={handleBypass}
                />
              )}

              {user && !kbaVerified && (
                <KBAVerification
                  onVerified={handleKBAVerified}
                  onError={handleKBAError}
                  selectedTestPerson={selectedTestPerson}
                />
              )}

              {user && kbaVerified && (
                <ConsentDashboard
                  onError={handleConsentError}
                  onSuccess={handleConsentSuccess}
                />
              )}
            </PageContainer>
          </Grid>

          {/* Activity Timeline Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <ActivityTimeline />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/**
 * Root App component.
 * Wraps the application with necessary providers.
 */
function App(): React.ReactElement {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
