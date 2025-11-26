import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { VerificationPayload } from '../types';
import { findAndVerifyPatient } from '../services/mockApi';

interface ClaimRecordPageProps {
  onRecordClaimed: (patient: any) => void;
}

const ClaimRecordPage: React.FC<ClaimRecordPageProps> = ({ onRecordClaimed }) => {
  const [formData, setFormData] = useState<Partial<VerificationPayload>>({
    fullName: 'Alex Johnson',
    dob: '1985-05-15',
    ssnLast4: '',
    address: '',
    medicaidId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    // Basic formatting for user experience
    if (name === 'dob') {
        formattedValue = value.replace(/\D/g, '');
        if (formattedValue.length > 4) {
            formattedValue = `${formattedValue.slice(0,4)}-${formattedValue.slice(4,6)}-${formattedValue.slice(6,8)}`;
        } else if (formattedValue.length > 2) {
            // This is a simplistic formatter, would use a library in a real app
        }
    }
     if (name === 'ssnLast4') {
        formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await findAndVerifyPatient(formData);
      if (result.status === 'perfect_match') {
        onRecordClaimed(result.patient);
      } else {
        setError('We could not find a record matching your information. Please double-check your details and try again.');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ name, label, value, placeholder, type = "text", maxLength } : { name: keyof VerificationPayload, label:string, value:string, placeholder: string, type?:string, maxLength?: number }) => (
      <div className="relative">
          <input
            id={name}
            name={name}
            type={type}
            className="block px-3.5 pb-2.5 pt-4 w-full text-sm text-on-surface bg-gray-50 rounded-t-lg border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
            placeholder=" "
            value={value}
            onChange={handleChange}
            disabled={isLoading}
            maxLength={maxLength}
          />
           <label htmlFor={name} className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3.5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">
            {label}
          </label>
      </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-surface rounded-lg shadow-xl">
        <div className="flex flex-col items-center">
          <LogoIcon className="w-16 h-16 text-primary" />
          <h1 className="mt-4 text-3xl font-bold text-center text-on-surface">
            Claim Your Health Record
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Enter your information to securely access your portal.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <InputField name="fullName" label="Full Name" value={formData.fullName || ''} placeholder="Jane Doe" />
          <InputField name="dob" label="Date of Birth" value={formData.dob || ''} placeholder="YYYY-MM-DD" type="text" maxLength={10} />
          <InputField name="ssnLast4" label="Last 4 of SSN" value={formData.ssnLast4 || ''} placeholder="1234" type="tel" maxLength={4} />
          <InputField name="address" label="Street Address" value={formData.address || ''} placeholder="123 Main St" />
          <InputField name="medicaidId" label="Medicaid ID (Optional)" value={formData.medicaidId || ''} placeholder="A123456789" />

          {error && <p className="text-sm text-center text-error">{error}</p>}
           <p className="text-xs text-center text-gray-500">
             For demo: Use 'Alex Johnson' and '1985-05-15' to find a record.
           </p>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-on-primary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 transition-all shadow-md hover:shadow-lg uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Verify My Identity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimRecordPage;