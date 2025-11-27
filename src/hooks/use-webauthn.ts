'use client';

import { useState, useEffect } from 'react';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { useAuth } from '@/context/auth-context';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

// IMPORTANT: This is a mock implementation. In a real app, the server would
// handle challenge generation, and storing/retrieving authenticator data.
// For this prototype, we'll store everything in localStorage.

// Mock server functions
const generateRegistrationOptions = (
  email: string,
  displayName: string
): PublicKeyCredentialCreationOptionsJSON => {
  const challenge = window.crypto.randomUUID();
  localStorage.setItem('webauthn-challenge', challenge);
  
  return {
    challenge,
    rp: {
      name: 'SICAKEP Finance App',
      id: window.location.hostname,
    },
    user: {
      id: email, // Use email as user ID for simplicity in this mock
      name: email,
      displayName: displayName,
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'required',
    },
    timeout: 60000,
    attestation: 'direct',
  };
};

const verifyRegistration = (
  response: RegistrationResponseJSON,
  expectedChallenge: string
) => {
    // In a real app, the server would perform extensive validation.
    // Here, we just check the challenge and store the authenticator.
    if (response.response.clientDataJSON) {
        const clientData = JSON.parse(atob(response.response.clientDataJSON));
        if (clientData.challenge !== expectedChallenge) {
            throw new Error('WebAuthn challenge does not match.');
        }
    }
    
    // Store authenticator data in localStorage (MOCK)
    const authenticators = JSON.parse(localStorage.getItem('webauthn-authenticators') || '[]');
    authenticators.push(response);
    localStorage.setItem('webauthn-authenticators', JSON.stringify(authenticators));
    localStorage.setItem('webauthn-registration-complete', 'true');
};

const generateAuthenticationOptions = (): PublicKeyCredentialRequestOptionsJSON => {
    const challenge = window.crypto.randomUUID();
    localStorage.setItem('webauthn-challenge', challenge);

    const authenticators = JSON.parse(localStorage.getItem('webauthn-authenticators') || '[]');
    
    return {
        challenge,
        allowCredentials: authenticators.map((auth: any) => ({
            id: auth.id,
            type: 'public-key',
            transports: auth.response.transports,
        })),
        timeout: 60000,
        userVerification: 'required',
    };
};

const verifyAuthentication = async (
    response: AuthenticationResponseJSON,
    expectedChallenge: string
) => {
    // In a real server, we would verify the signature.
    // For this mock, we just check the challenge and find the user.
    if (response.response.clientDataJSON) {
        const clientData = JSON.parse(atob(response.response.clientDataJSON));
        if (clientData.challenge !== expectedChallenge) {
            throw new Error('WebAuthn challenge does not match.');
        }
    }
    const userHandle = response.response.userHandle ? atob(response.response.userHandle) : null;
    if (!userHandle) {
        throw new Error('User handle not found in authentication response.');
    }
    // Return the user handle (email in our case) for login
    return userHandle;
};


export function useWebAuthn() {
  const { loginWithToken } = useAuth();
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);


  useEffect(() => {
    const checkSupport = async () => {
      // Check for WebAuthn support
      if (
        window.PublicKeyCredential &&
        (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
      ) {
        setIsWebAuthnSupported(true);
      }
    };

    const checkRegistration = () => {
        // Check if registration was completed before
        const storedRegistration = localStorage.getItem('webauthn-registration-complete');
        if (storedRegistration) {
            setIsRegistrationComplete(true);
        }
    }
    
    checkSupport();
    checkRegistration();

  }, []);

  const register = async (email: string, displayName: string) => {
    if (!isWebAuthnSupported) throw new Error('WebAuthn is not supported on this browser/device.');

    setIsRegistering(true);
    try {
      // 1. Get options from "server"
      const options = generateRegistrationOptions(email, displayName);

      // 2. Start registration with browser
      const registrationResponse = await startRegistration(options);

      // 3. Send response to "server" for verification
      const expectedChallenge = localStorage.getItem('webauthn-challenge');
      verifyRegistration(registrationResponse, expectedChallenge!);

      setIsRegistrationComplete(true);
    } finally {
      setIsRegistering(false);
      localStorage.removeItem('webauthn-challenge');
    }
  };

  const authenticate = async () => {
    if (!isWebAuthnSupported) throw new Error('WebAuthn is not supported on this browser/device.');
    if (!isRegistrationComplete) throw new Error('No fingerprint registered. Please log in with password to register.');

    setIsAuthenticating(true);
    try {
        // 1. Get options from "server"
        const options = generateAuthenticationOptions();
        if(!options.allowCredentials || options.allowCredentials.length === 0){
            throw new Error('No fingerprint registered for any user.');
        }

        // 2. Start authentication with browser
        const authResponse = await startAuthentication(options);

        // 3. Send response to "server" for verification
        const expectedChallenge = localStorage.getItem('webauthn-challenge');
        const userEmail = await verifyAuthentication(authResponse, expectedChallenge!);

        // 4. "Log in" the user. In a real app, the server would issue a session token.
        // Here, we'll call a mock login function in the auth context.
        if (loginWithToken) {
            await loginWithToken(userEmail);
        } else {
            console.warn("loginWithToken is not defined in AuthContext. Mocking login.");
        }
    } finally {
        setIsAuthenticating(false);
        localStorage.removeItem('webauthn-challenge');
    }
  };

  return {
    isWebAuthnSupported,
    isRegistrationComplete,
    register,
    authenticate,
    isRegistering,
    isAuthenticating,
  };
}
