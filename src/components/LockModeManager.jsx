import React, { createContext, useContext, useState, useEffect } from 'react';

const LockModeContext = createContext();

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
      return localStorage.getItem('caregiverPin') || '1234';
    } catch {
      return '1234';
    }
  });

  // True if caregiver has never changed the default PIN
  const isDefaultPin = caregiverPin === '1234' && !localStorage.getItem('caregiverPinChanged');

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

  const unlockMode = (enteredPin) => {
    if (enteredPin === caregiverPin) {
      setLockedMode(null);
      return true;
    }
    return false;
  };

  const updateCaregiverPin = (newPin) => {
    setCaregiverPin(newPin);
    try {
      localStorage.setItem('caregiverPin', newPin);
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