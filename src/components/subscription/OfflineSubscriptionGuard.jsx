// App is completely free — always subscribed
export function useSubscriptionStatus() {
  return {
    data: { isSubscribed: true, isPremium: true, subscription: null, isOnline: true },
    isLoading: false,
    error: null,
  };
}