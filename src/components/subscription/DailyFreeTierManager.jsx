/**
 * Daily Free Tier Manager
 * Tracks and enforces daily usage limits for free users
 */

import { base44 } from '@/api/base44Client';

class DailyFreeTierManager {
  async checkLimit(userEmail, featureType = 'chat') {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's usage record
      const records = await base44.entities.DailyFreeTierUsage.filter({
        user_email: userEmail,
        date: today
      });

      if (records.length === 0) {
        // Create new daily record
        await base44.entities.DailyFreeTierUsage.create({
          user_email: userEmail,
          date: today,
          chat_messages_used: 0,
          memories_viewed: 0,
          voice_minutes_used: 0,
          is_limit_exceeded: false
        });
        return { canUse: true, used: 0, limit: this.getLimit(featureType), remaining: this.getLimit(featureType) };
      }

      const record = records[0];
      const limit = this.getLimit(featureType);
      const used = record[this.getUsageField(featureType)];
      const canUse = used < limit;

      return {
        canUse,
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isExceeded: !canUse,
        record
      };
    } catch (error) {
      console.error('Failed to check free tier limit:', error);
      // Graceful fallback - allow use if check fails
      return { canUse: true, used: 0, limit: this.getLimit(featureType), remaining: this.getLimit(featureType), error: true };
    }
  }

  async recordUsage(userEmail, featureType = 'chat', amount = 1) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const field = this.getUsageField(featureType);
      
      const records = await base44.entities.DailyFreeTierUsage.filter({
        user_email: userEmail,
        date: today
      });

      if (records.length === 0) {
        // Create new record with usage
        const data = {
          user_email: userEmail,
          date: today,
          is_limit_exceeded: false
        };
        data[field] = amount;
        await base44.entities.DailyFreeTierUsage.create(data);
      } else {
        // Update existing record
        const record = records[0];
        const newUsage = (record[field] || 0) + amount;
        const limit = this.getLimit(featureType);
        
        await base44.entities.DailyFreeTierUsage.update(record.id, {
          [field]: newUsage,
          is_limit_exceeded: newUsage >= limit
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to record usage:', error);
      return false;
    }
  }

  getLimit(featureType) {
    const limits = {
      chat: 5,           // 5 chat messages per day
      memories: 10,      // 10 memory views per day
      voice: 15          // 15 minutes of voice per day
    };
    return limits[featureType] || 5;
  }

  getUsageField(featureType) {
    const fields = {
      chat: 'chat_messages_used',
      memories: 'memories_viewed',
      voice: 'voice_minutes_used'
    };
    return fields[featureType] || 'chat_messages_used';
  }

  async resetDailyLimits(userEmail) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = await base44.entities.DailyFreeTierUsage.filter({
        user_email: userEmail,
        date: today
      });

      if (records.length > 0) {
        await base44.entities.DailyFreeTierUsage.update(records[0].id, {
          chat_messages_used: 0,
          memories_viewed: 0,
          voice_minutes_used: 0,
          is_limit_exceeded: false
        });
      }
      return true;
    } catch (error) {
      console.error('Failed to reset daily limits:', error);
      return false;
    }
  }
}

export const dailyFreeTierManager = new DailyFreeTierManager();