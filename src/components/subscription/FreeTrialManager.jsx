export function isFreeTrial() {
  // Check for trial data - support both old and new key formats
  let trialData = null;
  
  // First check new format (specific to user)
  const keys = Object.keys(localStorage);
  const trialKey = keys.find(k => k.startsWith('freeTrialUser_'));
  if (trialKey) {
    trialData = localStorage.getItem(trialKey);
  } else {
    // Fallback to old format
    trialData = localStorage.getItem('freeTrialUser');
  }
  
  if (!trialData) return false;

  try {
    const trial = JSON.parse(trialData);
    const endDate = new Date(trial.trial_end_date || trial.trialEndDate);
    return new Date() < endDate;
  } catch {
    return false;
  }
}

export function getTrialEndDate() {
  let trialData = null;
  const keys = Object.keys(localStorage);
  const trialKey = keys.find(k => k.startsWith('freeTrialUser_'));
  if (trialKey) {
    trialData = localStorage.getItem(trialKey);
  } else {
    trialData = localStorage.getItem('freeTrialUser');
  }
  
  if (!trialData) return null;

  try {
    const trial = JSON.parse(trialData);
    return new Date(trial.trial_end_date || trial.trialEndDate);
  } catch {
    return null;
  }
}

export function getTrialUser() {
  let trialData = null;
  const keys = Object.keys(localStorage);
  const trialKey = keys.find(k => k.startsWith('freeTrialUser_'));
  if (trialKey) {
    trialData = localStorage.getItem(trialKey);
  } else {
    trialData = localStorage.getItem('freeTrialUser');
  }
  
  if (!trialData) return null;

  try {
    return JSON.parse(trialData);
  } catch {
    return null;
  }
}

export function clearFreeTrial() {
  // Clear all trial-related keys
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('freeTrialUser')) {
      localStorage.removeItem(key);
    }
  });
}