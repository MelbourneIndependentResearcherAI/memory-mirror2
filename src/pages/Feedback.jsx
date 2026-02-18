import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Plus, Filter, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Community Feedback
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Share your experience and read what others are saying
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Write Feedback
          </Button>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-white" />
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

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
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

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
              <TrendingUp className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No feedback yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Be the first to share your experience!
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
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
    </div>
  );
}