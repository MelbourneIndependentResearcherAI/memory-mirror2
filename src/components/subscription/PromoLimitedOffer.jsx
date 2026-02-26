import React, { useState, useEffect } from 'react';
import { Zap, Users, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PromoLimitedOffer({ variant = 'banner' }) {
  const navigate = useNavigate();
  const [remainingSlots, setRemainingSlots] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemainingSlots = async () => {
      try {
        // Count active/pending lifetime subscriptions at $9.99
        const subscriptions = await base44.entities.Subscription.filter({
          plan_name: 'premium',
          is_lifetime_deal: true
        });
        const remaining = Math.max(0, 200 - (subscriptions?.length || 0));
        setRemainingSlots(remaining);
      } catch (error) {
        console.error('Failed to fetch promo status:', error);
        setRemainingSlots(200); // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchRemainingSlots();
  }, []);

  const percentage = loading ? 0 : Math.round(((200 - remainingSlots) / 200) * 100);
  const isAlmostGone = remainingSlots <= 20;

  if (variant === 'banner') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-0.5 mb-8 rounded-xl">
        <div className="bg-white dark:bg-slate-900 rounded-[10px] p-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                  🔥 LIMITED TIME
                </Badge>
                {isAlmostGone && (
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse">
                    ⏰ ALMOST GONE
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Lifetime Access for Half Price! 💎
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                First 200 users get <strong>lifetime access for only $9.99/month</strong> instead of $14.99. 
                Lock in this price forever—no price increases ever!
              </p>
              
              {!loading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {200 - remainingSlots} users have locked in lifetime access • {remainingSlots} spots remaining
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => navigate(createPageUrl('Pricing'))}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold px-8 py-6 text-lg whitespace-nowrap gap-2 min-h-[60px]"
            >
              <Zap className="w-5 h-5" />
              Claim Your Spot Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2 border-orange-300 dark:border-orange-700 mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 opacity-20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative p-8 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-pulse" />
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
                ⏰ LIMITED TIME OFFER
              </Badge>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Lifetime Access — Lock in 50% Off
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Be one of the first 200 to get <strong>lifetime access for $9.99/month</strong> instead of $12.99
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Never Pay More Again</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Locked-in price forever, even if we raise to $12.99 or higher</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Offer Expires When Slots Fill</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Only {remainingSlots} lifetime spots remaining</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Full Premium Access Immediately</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Unlimited conversations, offline mode, family sharing & more</p>
              </div>
            </div>
          </div>

          {!loading && (
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {Math.round((200 - remainingSlots) / 2)}% of lifetime slots claimed
                </span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  {remainingSlots} left
                </span>
              </div>
              <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={() => navigate(createPageUrl('Pricing'))}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-6 text-lg gap-2 min-h-[56px]"
          >
            <Zap className="w-5 h-5" />
            Lock In Lifetime Access Now
          </Button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Once the 200 spots are filled, this offer ends forever. New subscribers pay $12.99/month.
          </p>
        </div>
      </Card>
    );
  }

  return null;
}