import { apiClient } from './api.client';
import type { User } from '../models/User';

/**
 * Google Cloud Identity Platform configuration.
 */
const GCIP_API_KEY = import.meta.env.VITE_GCIP_API_KEY;
const GCIP_BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

/**
 * Authentication service for managing user authentication.
 * Handles Google Cloud Identity Platform integration and mock authentication.
 */
class AuthService {
  /**
   * Signs in a user with email using GCIP email link authentication.
   * Sends a sign-in link to the user's email address.
   * 
   * @param email - User's email address
   * @returns Promise resolving to the response data
   * @throws ApiError if the request fails
   */
  async sendSignInLink(email: string): Promise<{ email: string }> {
    if (!GCIP_API_KEY) {
      console.warn('GCIP API key not configured, using mock authentication');
      return { email };
    }

    try {
      const response = await fetch(`${GCIP_BASE_URL}:sendOobCode?key=${GCIP_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'EMAIL_SIGNIN',
          email,
          continueUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send sign-in link');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      throw error;
    }
  }

  /**
   * Mock sign-in for development and testing.
   * Returns a mock user object with a fake token.
   * 
   * @param email - Optional email address (defaults to test email)
   * @returns Mock user object
   */
  mockSignIn(email: string = 'user@example.com'): User {
    const mockUser: User = {
      uid: 'mock-user-' + Date.now(),
      email,
      idToken: 'mock-id-token-' + Math.random().toString(36).substring(7),
      kbaVerified: false,
      createdAt: new Date(),
    };

    // Set the auth token in the API client
    apiClient.setAuthToken(mockUser.idToken);

    return mockUser;
  }

  /**
   * Verifies an ID token with Google Cloud Identity Platform.
   * 
   * @param _idToken - The ID token to verify (unused in mock implementation)
   * @returns Promise resolving to user claims
   * @throws Error if verification fails
   */
  async verifyIdToken(_idToken: string): Promise<{ uid: string; email: string }> {
    // In production, this would verify the token with GCIP
    // For now, we'll use a mock implementation
    if (!GCIP_API_KEY) {
      console.warn('GCIP API key not configured, skipping token verification');
      return {
        uid: 'mock-uid',
        email: 'user@example.com',
      };
    }

    // TODO: Implement actual GCIP token verification
    // This would typically be done on the backend for security
    throw new Error('Token verification not yet implemented');
  }

  /**
   * Signs out the current user.
   * Clears the authentication token from the API client.
   */
  signOut(): void {
    apiClient.clearAuthToken();
  }

  /**
   * Sets the authentication token for API requests.
   * 
   * @param token - The authentication token
   */
  setAuthToken(token: string): void {
    apiClient.setAuthToken(token);
  }

  /**
   * Gets the current authentication token.
   * 
   * @returns The current auth token or null
   */
  getAuthToken(): string | null {
    return apiClient.getAuthToken();
  }
}

// Export singleton instance
export const authService = new AuthService();
