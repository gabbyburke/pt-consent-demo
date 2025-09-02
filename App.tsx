import React, { useState, useCallback } from 'react';
import { Patient } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ClaimRecordPage from './components/ClaimRecordPage';
import DisclaimerPage from './components/DisclaimerPage';

type AuthState = 'claiming' | 'disclaimer' | 'authenticated';

const App: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [authState, setAuthState] = useState<AuthState>('claiming');

  const handleRecordClaimed = useCallback((claimedPatient: Patient) => {
    setPatient(claimedPatient);
    setAuthState('disclaimer');
  }, []);

  const handleDisclaimerAccepted = useCallback(() => {
    setAuthState('authenticated');
  }, []);

  const handleLogout = useCallback(() => {
    setPatient(null);
    setAuthState('claiming');
  }, []);
  
  const updatePatient = useCallback((updatedPatient: Patient) => {
    setPatient(updatedPatient);
  }, []);

  const renderContent = () => {
    switch (authState) {
      case 'claiming':
        return <ClaimRecordPage onRecordClaimed={handleRecordClaimed} />;
      case 'disclaimer':
        return <DisclaimerPage patientName={patient?.name || ''} onAccept={handleDisclaimerAccepted} />;
      case 'authenticated':
        if (!patient) {
          // Should not happen, but handle gracefully
          handleLogout();
          return null;
        }
        return <Dashboard patient={patient} onPatientUpdate={updatePatient} />;
      default:
         return <div>Error: Unknown application state.</div>;
    }
  };

  const isAuthenticated = authState === 'authenticated' && patient;

  return (
    <div className="min-h-screen bg-background font-sans text-on-background">
      {isAuthenticated && (
        <Header 
          patientName={patient.name} 
          onLogout={handleLogout} 
        />
      )}
      <main className={`transition-all duration-300 ${isAuthenticated ? 'pt-16' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;