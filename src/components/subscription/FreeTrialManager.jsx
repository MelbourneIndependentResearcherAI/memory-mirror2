export function isFreeTrial() {
  const trialUser = localStorage.getItem('freeTrialUser');
  if (!trialUser) return false;

  try {
    const trial = JSON.parse(trialUser);
    const endDate = new Date(trial.trialEndDate);
    return new Date() < endDate;
  } catch {
    return false;
  }
}

export function getTrialEndDate() {
  const trialUser = localStorage.getItem('freeTrialUser');
  if (!trialUser) return null;

  try {
    const trial = JSON.parse(trialUser);
    return new Date(trial.trialEndDate);
  } catch {
    return null;
  }
}

export function getTrialUser() {
  const trialUser = localStorage.getItem('freeTrialUser');
  if (!trialUser) return null;

  try {
    return JSON.parse(trialUser);
  } catch {
    return null;
  }
}

export function clearFreeTrial() {
  localStorage.removeItem('freeTrialUser');
}