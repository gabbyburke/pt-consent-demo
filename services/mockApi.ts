import { Patient, Provider, AccessLog, ProviderType, SharingPreference, VerificationPayload, VerificationResult } from '../types';

// MOCK DATA
const mockProviders: Provider[] = [
  { id: 'p001', name: 'Denver Health Medical Center', type: ProviderType.PHYSICAL, address: '777 Bannock St, Denver, CO 80204', logoUrl: 'https://picsum.photos/seed/denverhealth/100' },
  { id: 'p002', name: 'Mental Health Center of Denver', type: ProviderType.BEHAVIORAL, address: '4141 E Dickenson Pl, Denver, CO 80222', logoUrl: 'https://picsum.photos/seed/mhcd/100' },
  { id: 'p003', name: 'Colorado Coalition for the Homeless', type: ProviderType.SOCIAL, address: '2100 Broadway, Denver, CO 80205', logoUrl: 'https://picsum.photos/seed/cch/100' },
  { id: 'p004', name: 'UCHealth University of Colorado Hospital', type: ProviderType.PHYSICAL, address: '12605 E 16th Ave, Aurora, CO 80045', logoUrl: 'https://picsum.photos/seed/uchealth/100' },
  { id: 'p005', name: 'Jefferson Center for Mental Health', type: ProviderType.BEHAVIORAL, address: '4851 Independence St, Wheat Ridge, CO 80033', logoUrl: 'https://picsum.photos/seed/jefferson/100' },
  { id: 'p006', name: 'Volunteers of America Colorado', type: ProviderType.SOCIAL, address: '2660 Larimer St, Denver, CO 80205', logoUrl: 'https://picsum.photos/seed/voa/100' },
  { id: 'p007', name: 'Boulder Community Health', type: ProviderType.PHYSICAL, address: '4747 Arapahoe Ave, Boulder, CO 80303', logoUrl: 'https://picsum.photos/seed/boulderhealth/100' },
  { id: 'p008', name: 'AspenPointe Health Services', type: ProviderType.BEHAVIORAL, address: '115 S Parkside Dr, Colorado Springs, CO 80910', logoUrl: 'https://picsum.photos/seed/aspenpointe/100' },
];

const mockPatient: Patient = {
  id: '12345',
  name: 'Alex Johnson',
  dob: '1985-05-15',
  ssnLast4: '6789',
  address: {
    street: '123 Main St',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
  },
  medicaidId: 'A123456789',
  sharingPreferences: [
    { providerId: 'p001', canShare: true },
    { providerId: 'p002', canShare: false },
    { providerId: 'p003', canShare: true },
    { providerId: 'p005', canShare: true },
  ],
};

const mockAccessHistory: AccessLog[] = [
    { id: 'ah001', providerId: 'p001', providerName: 'Denver Health Medical Center', providerType: ProviderType.PHYSICAL, date: '2024-07-20T10:30:00Z', dataTypesShared: ['Lab Results', 'Medication History'] },
    { id: 'ah002', providerId: 'p003', providerName: 'Colorado Coalition for the Homeless', providerType: ProviderType.SOCIAL, date: '2024-07-18T14:00:00Z', dataTypesShared: ['Housing Status', 'Contact Information'] },
    { id: 'ah003', providerId: 'p001', providerName: 'Denver Health Medical Center', providerType: ProviderType.PHYSICAL, date: '2024-07-15T09:15:00Z', dataTypesShared: ['Visit Summary'] },
    { id: 'ah004', providerId: 'p005', providerName: 'Jefferson Center for Mental Health', providerType: ProviderType.BEHAVIORAL, date: '2024-07-12T11:00:00Z', dataTypesShared: ['Therapy Notes', 'Diagnosis'] },
    { id: 'ah005', providerId: 'p001', providerName: 'Denver Health Medical Center', providerType: ProviderType.PHYSICAL, date: '2024-06-28T16:45:00Z', dataTypesShared: ['Allergies', 'Immunizations'] },
];

// MOCK API FUNCTIONS
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getPatientData = async (patientId: string): Promise<Patient | null> => {
  await simulateDelay(500);
  if (patientId === mockPatient.id) {
    return Promise.resolve(JSON.parse(JSON.stringify(mockPatient)));
  }
  return Promise.resolve(null);
};


export const findAndVerifyPatient = async (payload: Partial<VerificationPayload>): Promise<VerificationResult> => {
    await simulateDelay(1500);

    const { fullName } = payload;
    
    // Normalize names for comparison
    const isNameMatch = fullName?.toLowerCase().trim() === mockPatient.name.toLowerCase();

    // For the prototype, we assume if the name matches, the user has filled out all
    // other information correctly on the first page. We skip the follow-up step.
    if (isNameMatch) {
        return { status: 'perfect_match', patient: JSON.parse(JSON.stringify(mockPatient)) };
    }

    // Fallback: No identifiable record
    return { status: 'no_match' };
};


export const getAllProviders = async (): Promise<Provider[]> => {
  await simulateDelay(500);
  return Promise.resolve(mockProviders);
};

export const getAccessHistory = async (): Promise<AccessLog[]> => {
    await simulateDelay(800);
    return Promise.resolve(mockAccessHistory);
};

export const updateSharingPreferences = async (patientId: string, newPreferences: SharingPreference[]): Promise<Patient> => {
    await simulateDelay(700);
    if (patientId === mockPatient.id) {
        // In a real app, you'd find the patient object and update it.
        // Here we just update the single mock patient.
        const updatedPatient = { ...mockPatient, sharingPreferences: newPreferences };
        return Promise.resolve(JSON.parse(JSON.stringify(updatedPatient)));
    }
    return Promise.reject(new Error('Patient not found'));
};