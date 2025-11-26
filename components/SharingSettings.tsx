import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Patient, Provider, ProviderType, SharingPreference } from '../types';
import { getAllProviders, updateSharingPreferences } from '../services/mockApi';
import { SocialIcon, BehavioralIcon, PhysicalIcon } from './icons/ProviderTypeIcons';

interface SharingSettingsProps {
    patient: Patient;
    onPatientUpdate: (patient: Patient) => void;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isLoading: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, isLoading }) => {
  const handleToggle = () => {
    if (!isLoading) {
      onChange(!enabled);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
        enabled ? 'bg-secondary' : 'bg-gray-300'
      } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      disabled={isLoading}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </button>
  );
};


const ProviderCard: React.FC<{
  provider: Provider;
  isSharingEnabled: boolean;
  onToggle: (providerId: string, newState: boolean) => void;
  isLoading: boolean;
}> = ({ provider, isSharingEnabled, onToggle, isLoading }) => {
  const typeStyles: { [key in ProviderType]: { icon: React.ReactNode; color: string } } = {
    [ProviderType.SOCIAL]: { icon: <SocialIcon />, color: 'bg-yellow-100 text-yellow-800' },
    [ProviderType.BEHAVIORAL]: { icon: <BehavioralIcon />, color: 'bg-purple-100 text-purple-800' },
    [ProviderType.PHYSICAL]: { icon: <PhysicalIcon />, color: 'bg-sky-100 text-sky-800' },
  };

  const { icon, color } = typeStyles[provider.type];

  return (
    <div className={`bg-white p-4 rounded-lg shadow flex items-center justify-between transition-all hover:shadow-md ${isLoading ? 'opacity-70' : ''}`}>
      <div className="flex items-center">
        <img src={provider.logoUrl} alt={`${provider.name} logo`} className="w-12 h-12 rounded-full mr-4 object-cover" />
        <div>
          <h3 className="font-bold text-lg text-on-surface">{provider.name}</h3>
          <p className="text-sm text-slate-600">{provider.address}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${color}`}>
            {icon}
            <span className="ml-1.5">{provider.type}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center ml-4">
        <ToggleSwitch enabled={isSharingEnabled} onChange={(newState) => onToggle(provider.id, newState)} isLoading={isLoading} />
        <span className="text-xs text-slate-500 mt-1">{isSharingEnabled ? 'Opt-In' : 'Opt-Out'}</span>
      </div>
    </div>
  );
};

const SharingSettings: React.FC<SharingSettingsProps> = ({ patient, onPatientUpdate }) => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [updatingProviderId, setUpdatingProviderId] = useState<string | null>(null);
    const [filter, setFilter] = useState<ProviderType | 'All'>('All');
    const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);
    const [showOptOutWarning, setShowOptOutWarning] = useState(false);

    useEffect(() => {
        const fetchProviders = async () => {
            setLoadingProviders(true);
            try {
                const fetchedProviders = await getAllProviders();
                setProviders(fetchedProviders);
            } catch (error) {
                console.error("Failed to fetch providers", error);
            } finally {
                setLoadingProviders(false);
            }
        };
        fetchProviders();
    }, []);
    
    const enabledProviderIds = useMemo(() => 
        new Set(patient.sharingPreferences.filter(p => p.canShare).map(p => p.providerId)), 
        [patient.sharingPreferences]
    );

    const isAllEnabled = useMemo(() => {
        if (providers.length === 0) return false;
        return providers.every(p => enabledProviderIds.has(p.id));
    }, [providers, enabledProviderIds]);

    const executeBulkUpdate = async (newState: boolean) => {
        if (showOptOutWarning) setShowOptOutWarning(false);
        
        setIsBulkUpdating(true);
        const newPreferences: SharingPreference[] = providers.map(p => ({
            providerId: p.id,
            canShare: newState,
        }));
        try {
            const updatedPatient = await updateSharingPreferences(patient.id, newPreferences);
            onPatientUpdate(updatedPatient);
        } catch (error) {
            console.error("Failed to bulk update preferences", error);
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleMasterToggleChange = (newState: boolean) => {
      if (newState === false) {
        setShowOptOutWarning(true);
      } else {
        executeBulkUpdate(true);
      }
    }
    
    const handleOptOutOfAllClick = () => {
        setShowOptOutWarning(true);
    };
    
    const handleToggle = async (providerId: string, newState: boolean) => {
        setUpdatingProviderId(providerId);
        
        const currentPreferences = patient.sharingPreferences;
        const existingPrefIndex = currentPreferences.findIndex(p => p.providerId === providerId);
        
        let newPreferences: SharingPreference[];
        if (existingPrefIndex > -1) {
            newPreferences = currentPreferences.map(p => p.providerId === providerId ? { ...p, canShare: newState } : p);
        } else {
            newPreferences = [...currentPreferences, { providerId, canShare: newState }];
        }
        
        try {
            const updatedPatient = await updateSharingPreferences(patient.id, newPreferences);
            onPatientUpdate(updatedPatient);
        } catch (error) {
            console.error("Failed to update preferences", error);
        } finally {
            setUpdatingProviderId(null);
        }
    };
    
    const isSharingEnabledForProvider = useCallback((providerId: string) => {
      return enabledProviderIds.has(providerId);
    }, [enabledProviderIds]);

    const sortedAndFilteredProviders = useMemo(() => {
        const filtered = filter === 'All' ? providers : providers.filter(p => p.type === filter);
        
        return [...filtered].sort((a, b) => {
            const aEnabled = isSharingEnabledForProvider(a.id);
            const bEnabled = isSharingEnabledForProvider(b.id);
            if (aEnabled === bEnabled) {
                return a.name.localeCompare(b.name);
            }
            return aEnabled ? -1 : 1;
        });
    }, [providers, filter, isSharingEnabledForProvider]);

    const FilterButton: React.FC<{type: ProviderType | 'All', label: string}> = ({type, label}) => (
        <button 
            onClick={() => setFilter(type)}
            disabled={isBulkUpdating || loadingProviders}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${filter === type ? 'bg-primary text-on-primary' : 'bg-gray-200 text-on-surface hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {label}
        </button>
    );

    const OptOutWarningModal = () => (
      <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 transition-opacity duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="warning-title"
      >
          <div className="bg-surface rounded-lg shadow-xl max-w-md w-full p-6 m-4 transform transition-all duration-300 scale-100">
              <div className="flex items-start">
                   <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                  </div>
                  <div className="ml-4 text-left">
                      <h3 id="warning-title" className="text-xl font-bold text-on-surface">Confirm Opt-Out</h3>
                      <div className="mt-2">
                          <p className="text-sm text-slate-600">
                              Opting out of all data sharing will make it more difficult for your providers to coordinate care on your behalf. This may impact the quality and efficiency of the services you receive.
                          </p>
                          <p className="text-sm text-slate-600 mt-2">
                              Are you sure you want to proceed?
                          </p>
                      </div>
                  </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                  <button
                      type="button"
                      onClick={() => setShowOptOutWarning(false)}
                      className="px-4 py-2 text-sm font-medium rounded-md text-on-surface bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition"
                  >
                      Cancel
                  </button>
                  <button
                      type="button"
                      onClick={() => executeBulkUpdate(false)}
                      className="px-4 py-2 text-sm font-medium rounded-md text-on-error bg-error hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error transition"
                  >
                      Confirm Opt-Out
                  </button>
              </div>
          </div>
      </div>
    );

    return (
      <section aria-labelledby="sharing-settings-heading">
        {showOptOutWarning && <OptOutWarningModal />}
        <div className="bg-surface shadow-lg rounded-lg">
            <div className="p-6 border-b border-gray-200">
                <h2 id="sharing-settings-heading" className="text-2xl font-bold text-on-surface">Manage Data Sharing</h2>
                <p className="text-slate-600 mt-1">Choose which providers can access your data.</p>
            </div>
            
            <div className="p-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-lg text-on-surface">Master Control</h2>
                        <p className="text-sm text-slate-600">Opt-in or opt-out of sharing with all providers.</p>
                    </div>
                    <div className="flex flex-col items-center ml-4">
                        <ToggleSwitch 
                            enabled={isAllEnabled} 
                            onChange={handleMasterToggleChange} 
                            isLoading={isBulkUpdating || loadingProviders} 
                        />
                        <span className="text-xs text-slate-500 mt-1">Share with All</span>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <FilterButton type="All" label="All Providers" />
                    <FilterButton type={ProviderType.PHYSICAL} label="Physical" />
                    <FilterButton type={ProviderType.BEHAVIORAL} label="Behavioral" />
                    <FilterButton type={ProviderType.SOCIAL} label="Social" />
                </div>

                {loadingProviders ? (
                    <p className="text-center text-slate-500">Loading providers...</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {sortedAndFilteredProviders.map(provider => (
                                <ProviderCard
                                    key={provider.id}
                                    provider={provider}
                                    isSharingEnabled={isSharingEnabledForProvider(provider.id)}
                                    onToggle={handleToggle}
                                    isLoading={updatingProviderId === provider.id || isBulkUpdating}
                                />
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                             <button
                                onClick={handleOptOutOfAllClick}
                                disabled={isBulkUpdating || loadingProviders}
                                className="px-6 py-3 text-sm font-medium uppercase tracking-wider text-on-error bg-error rounded-md shadow-sm hover:shadow-md transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                             >
                                 Opt-Out of All Sharing
                             </button>
                        </div>
                    </>
                )}
            </div>
        </div>
      </section>
    );
};

export default SharingSettings;