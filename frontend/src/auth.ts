import axios from 'axios';

const API_KEY = import.meta.env.VITE_GCIP_API_KEY;
const BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

export const signInWithEmail = async (email: string) => {
  // For prototype, we might use sign in with password or sendOobCode for email link
  // This is a simplified example using password for demonstration if enabled, 
  // or we can implement the "sendSignInLinkToEmail" flow via REST.
  // https://cloud.google.com/identity-platform/docs/use-rest-api#section-send-email-link
  
  try {
    const response = await axios.post(`${BASE_URL}:sendOobCode?key=${API_KEY}`, {
      requestType: "EMAIL_SIGNIN",
      email: email,
      continueUrl: window.location.href,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending email link", error);
    throw error;
  }
};

// Simplified mock for the prototype if no API key provided
export const mockSignIn = () => {
  return {
    idToken: "mock-id-token-xyz",
    email: "user@example.com",
    localId: "user-123"
  };
};
