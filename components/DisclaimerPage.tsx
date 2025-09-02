import React, { useState } from 'react';

interface DisclaimerPageProps {
  patientName: string;
  onAccept: () => void;
}

const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ patientName, onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-xl p-8 space-y-6 bg-surface rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold text-on-surface">Confirmation & Disclaimer</h1>
        <p className="text-slate-600">
          You are about to access the health information portal for:
        </p>
        <p className="text-2xl font-bold text-primary py-4 px-6 bg-blue-50 rounded-lg inline-block">
          {patientName}
        </p>
        <div className="text-left space-y-4 text-slate-700 text-sm py-4 border-y border-gray-200">
            <p>
                By checking the box and proceeding, you are electronically signing and attesting under penalty of law that you are the individual named above or a legally authorized representative.
            </p>
            <p>
                Unauthorized access to or use of this system and its data is prohibited and may be subject to civil and criminal penalties. All actions are logged and monitored.
            </p>
        </div>
        
        <div className="flex items-center justify-center pt-4">
            <input
                id="confirm-checkbox"
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
                className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="confirm-checkbox" className="ml-3 text-sm font-medium text-gray-900">
                I confirm that I am {patientName} and I agree to the terms.
            </label>
        </div>

        <div>
            <button
              onClick={onAccept}
              disabled={!isChecked}
              className="w-full max-w-sm mx-auto flex justify-center py-3 px-4 mt-4 border border-transparent text-sm font-medium rounded-md text-on-primary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg uppercase tracking-wider"
            >
              Access My Portal
            </button>
          </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
