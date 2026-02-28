import React, { createContext, useContext, useState, useEffect } from 'react';

const FeatureLockContext = createContext();

const DEFAULT_PIN_HASH = 'DL1j3YozA7aL0mDgWTLAJ+TXDX1/vJMAZxLVVWN9Aao=';

async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

async function verifyPin(inputPin, storedHash) {
  const inputHash = await hashPin(inputPin);
  return inputHash === storedHash;
}

export const useFeatureLock = () => {
  const context = useContext(FeatureLockContext);
  if (!context) {
    throw new Error('useFeatureLock must be used within FeatureLockProvider');
  }
  return context;
};

export const FeatureLockProvider = ({ children }) => {
  // Lock config: { featureName: { locked: bool, whitelistedScreens: [], nightGuardOnly: bool } }
  const [lockConfigs, setLockConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('featureLockConfigs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [caregiverPin, setCaregiverPin] = useState(() => {
    try {
      return localStorage.getItem('caregiverPinFeatureLock') || DEFAULT_PIN_HASH;
    } catch {
      return DEFAULT_PIN_HASH;
    }
  });

  const [nightGuardActive, setNightGuardActive] = useState(() => {
    try {
      return localStorage.getItem('nightGuardLockActive') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('featureLockConfigs', JSON.stringify(lockConfigs));
    } catch (e) {
      console.error('Failed to save lock configs:', e);
    }
  }, [lockConfigs]);

  useEffect(() => {
    try {
      localStorage.setItem('nightGuardLockActive', nightGuardActive);
    } catch (e) {
      console.error('Failed to save night guard status:', e);
    }
  }, [nightGuardActive]);

  // Check if a feature is locked
  const isFeatureLocked = (featureName) => {
    const config = lockConfigs[featureName];
    return config?.locked === true;
  };

  // Check if a screen is accessible within a feature lock
  const isScreenAccessibleInLock = (featureName, screenName) => {
    const config = lockConfigs[featureName];
    if (!config?.locked) return true;
    
    // If whitelisted screens are defined, check if screen is in the list
    if (config.whitelistedScreens && config.whitelistedScreens.length > 0) {
      return config.whitelistedScreens.includes(screenName);
    }
    
    return false;
  };

  // Lock a feature
  const lockFeature = (featureName, whitelistedScreens = [], nightGuardOnly = false) => {
    setLockConfigs(prev => ({
      ...prev,
      [featureName]: {
        locked: true,
        whitelistedScreens: whitelistedScreens || [],
        nightGuardOnly
      }
    }));
  };

  // Unlock a feature with PIN
  const unlockFeature = async (featureName, enteredPin) => {
    try {
      const success = await verifyPin(enteredPin, caregiverPin);
      if (success) {
        setLockConfigs(prev => ({
          ...prev,
          [featureName]: {
            ...prev[featureName],
            locked: false
          }
        }));
      }
      return success;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  };

  // Activate Night Guard lock (only carers can deactivate)
  const activateNightGuardLock = (featureName, whitelistedScreens = []) => {
    lockFeature(featureName, whitelistedScreens, true);
    setNightGuardActive(true);
  };

  // Deactivate Night Guard lock (requires PIN)
  const deactivateNightGuardLock = async (featureName, enteredPin) => {
    try {
      const success = await verifyPin(enteredPin, caregiverPin);
      if (success) {
        setLockConfigs(prev => ({
          ...prev,
          [featureName]: {
            ...prev[featureName],
            locked: false,
            nightGuardOnly: false
          }
        }));
        setNightGuardActive(false);
      }
      return success;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  };

  // Check if night guard mode is active
  const isNightGuardActive = () => nightGuardActive;

  // Check if a feature has night guard lock
  const hasNightGuardLock = (featureName) => {
    const config = lockConfigs[featureName];
    return config?.nightGuardOnly === true && config?.locked === true;
  };

  // Update caregiver PIN
  const updateCaregiverPin = async (newPin) => {
    try {
      const hashedPin = await hashPin(newPin);
      setCaregiverPin(hashedPin);
      localStorage.setItem('caregiverPinFeatureLock', hashedPin);
    } catch (e) {
      console.error('Failed to save PIN:', e);
    }
  };

  return (
    <FeatureLockContext.Provider
      value={{
        lockConfigs,
        isFeatureLocked,
        isScreenAccessibleInLock,
        lockFeature,
        unlockFeature,
        activateNightGuardLock,
        deactivateNightGuardLock,
        isNightGuardActive,
        hasNightGuardLock,
        updateCaregiverPin,
        caregiverPin
      }}
    >
      {children}
    </FeatureLockContext.Provider>
  );
};