import React, { createContext, useContext, useState, useEffect } from 'react';

const LockModeContext = createContext();

// Default PIN hash (SHA-256 of '1234')
const DEFAULT_PIN_HASH = 'DL1j3YozA7aL0mDgWTLAJ+TXDX1/vJMAZxLVVWN9Aao=';

// Hash PIN with SHA-256
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

// Verify PIN against stored hash
async function verifyPin(inputPin, storedHash) {
  const inputHash = await hashPin(inputPin);
  return inputHash === storedHash;
}

export const useLockMode = () => {
  const context = useContext(LockModeContext);
  if (!context) {
    throw new Error('useLockMode must be used within LockModeProvider');
  }
  return context;
};

export const LockModeProvider = ({ children }) => {
  const [lockedMode, setLockedMode] = useState(() => {
    try {
      return localStorage.getItem('lockedMode') || null;
    } catch {
      return null;
    }
  });

  const [caregiverPin, setCaregiverPin] = useState(() => {
    try {
      return localStorage.getItem('caregiverPin') || DEFAULT_PIN_HASH;
    } catch {
      return DEFAULT_PIN_HASH;
    }
  });

  // True if caregiver has never changed the default PIN
  const isDefaultPin = caregiverPin === DEFAULT_PIN_HASH && !localStorage.getItem('caregiverPinChanged');

  useEffect(() => {
    try {
      if (lockedMode) {
        localStorage.setItem('lockedMode', lockedMode);
      } else {
        localStorage.removeItem('lockedMode');
      }
    } catch (e) {
      console.error('Failed to save lock mode:', e);
    }
  }, [lockedMode]);

  const lockMode = (mode) => {
    setLockedMode(mode);
  };

  const unlockMode = async (enteredPin) => {
    try {
      const success = await verifyPin(enteredPin, caregiverPin);
      if (success) {
        setLockedMode(null);
      }
      return success;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  };

  const updateCaregiverPin = async (newPin) => {
    try {
      const hashedPin = await hashPin(newPin);
      setCaregiverPin(hashedPin);
      localStorage.setItem('caregiverPin', hashedPin);
      localStorage.setItem('caregiverPinChanged', 'true');
    } catch (e) {
      console.error('Failed to save PIN:', e);
    }
  };

  const isLocked = (mode) => {
    return lockedMode === mode;
  };

  const isAnyModeLocked = () => {
    return lockedMode !== null;
  };

  return (
    <LockModeContext.Provider
      value={{
        lockedMode,
        lockMode,
        unlockMode,
        updateCaregiverPin,
        isLocked,
        isAnyModeLocked,
        caregiverPin,
        isDefaultPin
      }}
    >
      {children}
    </LockModeContext.Provider>
  );
};