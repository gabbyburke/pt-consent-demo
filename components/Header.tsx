import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface HeaderProps {
  patientName: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ patientName, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-on-primary">
                <LogoIcon className="h-8 w-8 text-white" />
                <span className="ml-2 font-bold text-xl hidden sm:block">CO SHIE Portal</span>
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-on-primary text-sm mr-4 hidden lg:block">
              Welcome, <span className="font-semibold">{patientName}</span>
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium uppercase tracking-wider text-on-error bg-error rounded-md shadow-sm hover:shadow-md transition-shadow"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;