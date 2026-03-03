import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";

const OPEN_PAGES = ["Landing", "Pricing", "Login", "Register", "Home", "QuickAccess", "BigButtonMode"];
const FREE_TIER_KEY = "mm_free_tier_user";
const TRIAL_KEY = "mm_trial_registered";

export default function AppTrialGate({ children, currentPageName, isAdmin }) {
  // Default to open to prevent blank screen — will gate only if check fails
  const [status, setStatus] = useState("open");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAccess();
  }, [currentPageName]);

  async function checkAccess() {
    // Open pages never blocked
    if (OPEN_PAGES.includes(currentPageName)) {
      setStatus("open");
      return;
    }

    // Free-tier user always allowed
    if (localStorage.getItem(FREE_TIER_KEY) === "true") {
      setStatus("open");
      return;
    }

    // Check if user is authenticated — logged-in users always get access
    try {
      const user = await base44.auth.me();
      if (user) {
        setStatus("open");
        return;
      }
    } catch (_) {
      // Not authenticated, continue to trial check
    }

    // Check if already registered for trial via local storage
    const savedEmail = localStorage.getItem(TRIAL_KEY);
    if (savedEmail) {
      try {
        const trials = await base44.entities.FreeTrialUser.filter({ email: savedEmail });
        if (trials.length > 0) {
          const trial = trials[0];
          const now = new Date();
          const end = new Date(trial.trial_end_date);
          if (trial.trial_active && now < end) {
            setStatus("open");
          } else {
            setStatus("expired");
          }
          return;
        }
      } catch (_) {
        // If error checking trial, keep open to avoid blocking
        setStatus("open");
        return;
      }
    }

    setStatus("show_form");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const existing = await base44.entities.FreeTrialUser.filter({ email: email.trim() });
      let trial;
      if (existing.length > 0) {
        trial = existing[0];
      } else {
        const now = new Date();
        const end = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        trial = await base44.entities.FreeTrialUser.create({
          name: name.trim(),
          email: email.trim(),
          trial_start_date: now.toISOString(),
          trial_end_date: end.toISOString(),
          trial_active: true,
        });
        try {
          await base44.entities.CollectedEmail.create({
            email: email.trim(),
            name: name.trim(),
            source: "free_trial",
          });
        } catch (_) {}
      }

      localStorage.setItem(TRIAL_KEY, email.trim());

      const now = new Date();
      const end = new Date(trial.trial_end_date);
      if (trial.trial_active && now < end) {
        setStatus("open");
      } else {
        setStatus("expired");
      }
    } catch (_) {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  function handleFreeTier() {
    localStorage.setItem(FREE_TIER_KEY, "true");
    setStatus("open");
  }

  if (status === "open") {
    return <>{children}</>;
  }

  if (status === "show_form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Your Free Trial</h1>
          <p className="text-gray-500 mb-6">Get 3 days of full access to Memory Mirror — no credit card required.</p>
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Your Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={submitting}>
              {submitting ? "Starting trial..." : "Start Free Trial"}
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-4">
            Already have an account?{" "}
            <a href={createPageUrl("Landing")} className="text-purple-600 underline">Sign in</a>
            {" · "}
            <a href={createPageUrl("Pricing")} className="text-purple-600 underline">View plans</a>
          </p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Free Trial Has Ended</h1>
          <p className="text-gray-500 mb-6">Subscribe to continue using all features, or continue with the free tier.</p>
          <div className="space-y-3">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => window.location.href = createPageUrl("Pricing")}
            >
              View Subscription Plans
            </Button>
            <Button variant="outline" className="w-full" onClick={handleFreeTier}>
              Continue with Free Tier (limited)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}