import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../models/User';

/**
 * Authentication context value interface.
 */
interface AuthContextValue {
  /** Current authenticated user or null */
  user: User | null;
  
  /** Whether KBA verification has been completed */
  kbaVerified: boolean;
  
  /** Loading state for auth operations */
  isLoading: boolean;
  
  /** Sign in with mock authentication */
  signIn: (email?: string) => void;
  
  /** Sign out the current user */
  signOut: () => void;
  
  /** Set KBA verification status */
  setKbaVerified: (verified: boolean) => void;
  
  /** Update user data */
  updateUser: (user: User) => void;
}

/**
 * Authentication context.
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for AuthProvider component.
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component.
 * Manages global authentication state and provides auth methods.
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [kbaVerified, setKbaVerifiedState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sign in with mock authentication.
   */
  const signIn = useCallback((email?: string) => {
    setIsLoading(true);
    try {
      const mockUser = authService.mockSignIn(email);
      setUser(mockUser);
      setKbaVerifiedState(false);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(() => {
    authService.signOut();
    setUser(null);
    setKbaVerifiedState(false);
  }, []);

  /**
   * Set KBA verification status.
   */
  const setKbaVerified = useCallback((verified: boolean) => {
    setKbaVerifiedState(verified);
    if (user) {
      setUser({ ...user, kbaVerified: verified });
    }
  }, [user]);

  /**
   * Update user data.
   */
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  // Restore auth token on mount if it exists
  useEffect(() => {
    const token = authService.getAuthToken();
    if (token && !user) {
      // In a real app, we would verify the token and restore user state
      // For now, we'll just clear it if there's no user
      authService.signOut();
    }
  }, [user]);

  const value: AuthContextValue = {
    user,
    kbaVerified,
    isLoading,
    signIn,
    signOut,
    setKbaVerified,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 * 
 * @returns Authentication context value
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
