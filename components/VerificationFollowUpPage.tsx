import React, { useState } from 'react';
import { VerificationField, VerificationPayload } from '../types';
import { findAndVerifyPatient, getPatientData } from '../services/mockApi';
import { LogoIcon } from './icons/LogoIcon';

interface VerificationFollowUpPageProps {
  fieldsToVerify: VerificationField[];
  patientId: string;
  onVerificationSuccess: (patient: any) => void;
}

const fieldLabels: Record<VerificationField, string> = {
  dob: 'Date of Birth',
  ssnLast4: 'Last 4 of SSN',
  address: 'Street Address',
  medicaidId: 'Medicaid ID',
};

const VerificationFollowUpPage: React.FC<VerificationFollowUpPageProps> = ({ fieldsToVerify, patientId, onVerificationSuccess }) => {
  const [formData, setFormData] = useState<Partial<VerificationPayload>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        // In a real app, you'd send the follow-up data to the backend.
        // Here, we'll simulate success by just fetching the patient record.
        const patient = await getPatientData(patientId);
        if (patient) {
            // A real API would re-verify with the new info.
            // We are simulating that the user entered the correct info.
            onVerificationSuccess(patient);
        } else {
             setError('Verification failed. Please try claiming your record again.');
        }

    } catch (err) {
      setError('An error occurred during verification. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const InputField = ({ name, label } : { name: VerificationField, label:string }) => (
      <div className="relative">
          <input
            id={name}
            name={name}
            type={name === 'ssnLast4' ? 'tel' : 'text'}
            className="block px-3.5 pb-2.5 pt-4 w-full text-sm text-on-surface bg-gray-50 rounded-t-lg border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
            placeholder=" "
            value={formData[name as keyof VerificationPayload] || ''}
            onChange={handleChange}
            disabled={isLoading}
            maxLength={name === 'ssnLast4' ? 4 : undefined}
            required
          />
           <label htmlFor={name} className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
            {label}
          </label>
      </div>
  );


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-lg shadow-xl">
        <div className="flex flex-col items-center">
          <LogoIcon className="w-16 h-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold text-center text-on-surface">
            Just a Few More Details
          </h1>
          <p className="mt-2 text-center text-gray-600">
            To protect your privacy, please confirm the following information.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {fieldsToVerify.map(field => (
             <InputField key={field} name={field} label={fieldLabels[field]} />
          ))}

          {error && <p className="text-sm text-center text-error">{error}</p>}
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-on-primary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 transition-all shadow-md hover:shadow-lg uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Confirm Identity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationFollowUpPage;
