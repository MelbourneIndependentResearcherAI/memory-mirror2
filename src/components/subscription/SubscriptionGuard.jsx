// App is completely free — subscription guard always passes
export function useSubscriptionStatus() {
  return {
    data: {
      isSubscribed: true,
      isPremium: true,
      isAdmin: false,
      isFreeTier: false,
      isOnFreeTrial: false,
      trialExpired: false,
      subscription: null,
      subscribedTools: [],
      hasToolAccess: () => true,
    },
    isLoading: false,
    error: null,
  };
}

export default function SubscriptionGuard({ children }) {
  return <>{children}</>;
}