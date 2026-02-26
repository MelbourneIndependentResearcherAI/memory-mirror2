import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Plus, Filter, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import FeedbackForm from '@/components/feedback/FeedbackForm';

export default function Feedback() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data: feedbacks = [], refetch, isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => base44.entities.Feedback.filter({ is_published: true }, '-created_date', 100),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['feedbackComments'],
    queryFn: () => base44.entities.FeedbackComment.filter({ is_published: true }),
  });

  const filteredFeedbacks = feedbacks
    .filter(f => filterCategory === 'all' || f.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      return 0;
    });

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = feedbacks.filter(f => f.rating === rating).length;
    const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 mb-8 shadow-premium-lg text-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-white/20 text-white mb-4 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-12 h-12" />
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg">
                  Community Feedback
                </h1>
                <p className="text-purple-100 text-lg">
                  Share your experience and read what others are saying
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white text-purple-600 hover:bg-purple-50 font-bold shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Write Feedback
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8">
            <FeedbackForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                refetch();
                setShowForm(false);
              }}
            />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-yellow-50 dark:from-slate-900 dark:to-yellow-950/20 rounded-2xl shadow-premium p-6 border-2 border-yellow-200 dark:border-yellow-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white fill-white drop-shadow-md" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {averageRating}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Average Rating
                </div>
              </div>
            </div>
            <div className="flex gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20 rounded-2xl shadow-premium p-6 border-2 border-blue-200 dark:border-blue-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-7 h-7 text-white drop-shadow-md" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {feedbacks.length}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Total Reviews
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 rounded-2xl shadow-premium p-6 border-2 border-purple-200 dark:border-purple-800/50">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-lg">
              Rating Distribution
            </h3>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-8">
                    {rating}★
                  </span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-8">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-premium p-6 mb-6 border-2 border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-slate-900 dark:text-slate-100">Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-5 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium shadow-sm hover:border-purple-400 transition-all"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="testimonial">Testimonials</option>
                <option value="feature_request">Feature Requests</option>
                <option value="bug_report">Bug Reports</option>
                <option value="suggestion">Suggestions</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-slate-900 dark:text-slate-100">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-5 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium shadow-sm hover:border-purple-400 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading feedback...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/20 rounded-3xl shadow-premium border-2 border-purple-200 dark:border-purple-700">
            <MessageSquare className="w-20 h-20 mx-auto mb-6 text-purple-300 dark:text-purple-600" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              No feedback yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
              Be the first to share your experience!
            </p>
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-premium font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Write Feedback
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                comments={comments}
                onUpdate={refetch}
              />
            ))}
          </div>
        )}
      </div>

      <PageLoadTip pageName="Feedback" />
    </div>
  );
}