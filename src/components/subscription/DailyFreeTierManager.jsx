// App is completely free — no daily limits enforced
export const dailyFreeTierManager = {
  async checkLimit() { return { canUse: true, used: 0, limit: Infinity, remaining: Infinity }; },
  async recordUsage() { return true; },
  getLimit() { return Infinity; },
  getUsageField(type) { return type + '_used'; },
  async resetDailyLimits() { return true; },
};