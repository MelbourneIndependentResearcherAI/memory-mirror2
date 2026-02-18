import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ShareButtons from './ShareButtons';
import { format } from 'date-fns';

export default function FeedbackCard({ feedback, comments, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentData, setCommentData] = useState({ user_name: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);

  const categoryColors = {
    general: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    testimonial: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    feature_request: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    bug_report: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    suggestion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  };

  const handleHelpful = async () => {
    if (hasVotedHelpful) {
      toast.info('You already marked this as helpful');
      return;
    }

    try {
      await base44.entities.Feedback.update(feedback.id, {
        helpful_count: (feedback.helpful_count || 0) + 1
      });
      setHasVotedHelpful(true);
      toast.success('Thanks for your feedback!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update helpful count:', error);
      toast.error('Failed to mark as helpful');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentData.user_name.trim() || !commentData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.FeedbackComment.create({
        feedback_id: feedback.id,
        ...commentData,
        is_published: true
      });

      await base44.entities.Feedback.update(feedback.id, {
        comment_count: (feedback.comment_count || 0) + 1
      });

      toast.success('Comment added!');
      setCommentData({ user_name: '', content: '' });
      setShowCommentForm(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackComments = comments?.filter(c => c.feedback_id === feedback.id) || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
            {feedback.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              {feedback.user_name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              {format(new Date(feedback.created_date), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[feedback.category]}`}>
          {feedback.category.replace('_', ' ')}
        </span>
      </div>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= feedback.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>

      <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {feedback.title}
      </h4>

      <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
        {feedback.content}
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          onClick={handleHelpful}
          variant="outline"
          size="sm"
          disabled={hasVotedHelpful}
          className={hasVotedHelpful ? 'bg-blue-50 dark:bg-blue-950' : ''}
        >
          <ThumbsUp className={`w-4 h-4 mr-1 ${hasVotedHelpful ? 'fill-blue-600' : ''}`} />
          Helpful ({feedback.helpful_count || 0})
        </Button>

        <Button
          onClick={() => setShowComments(!showComments)}
          variant="outline"
          size="sm"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          Comments ({feedback.comment_count || 0})
        </Button>

        <div className="ml-auto">
          <ShareButtons feedback={feedback} />
        </div>
      </div>

      {showComments && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
          {feedbackComments.length > 0 ? (
            feedbackComments.map((comment) => (
              <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {comment.user_name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(comment.created_date), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}

          {!showCommentForm ? (
            <Button
              onClick={() => setShowCommentForm(true)}
              variant="outline"
              className="w-full"
            >
              Add a Comment
            </Button>
          ) : (
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Input
                placeholder="Your name"
                value={commentData.user_name}
                onChange={(e) => setCommentData({ ...commentData, user_name: e.target.value })}
                required
              />
              <Textarea
                placeholder="Write your comment..."
                value={commentData.content}
                onChange={(e) => setCommentData({ ...commentData, content: e.target.value })}
                rows={3}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCommentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}