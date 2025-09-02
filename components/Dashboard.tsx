import React from 'react';
import { Patient } from '../types';
import SharingSettings from './SharingSettings';
import AccessHistory from './AccessHistory';

interface DashboardProps {
    patient: Patient;
    onPatientUpdate: (patient: Patient) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patient, onPatientUpdate }) => {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-on-background">Patient Dashboard</h1>
                <p className="text-slate-600 mt-1">Manage your sharing preferences and view your data access history.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
                {/* Manage Data Sharing is now on top */}
                <SharingSettings patient={patient} onPatientUpdate={onPatientUpdate} />
                {/* Data Access History is now underneath */}
                <AccessHistory />
            </div>
        </div>
    );
};

export default Dashboard;