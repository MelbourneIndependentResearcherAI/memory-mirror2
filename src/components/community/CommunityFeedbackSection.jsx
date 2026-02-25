import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, ThumbsUp, Trash2, Send, Users, Lightbulb, Heart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const categoryIcons = {
  feature_request: Lightbulb,
  improvement: Users,
  testimonial: Heart,
  general: MessageSquare
};

const categoryColors = {
  feature_request: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  improvement: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  testimonial: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
};

export default function CommunityFeedbackSection() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    suggestion: '',
    category: 'general'
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAdmin(currentUser?.role === 'admin');
      } catch (error) {
        setUser(null);
        setIsAdmin(false);
      }
    };
    checkUser();
  }, []);

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['communityFeedback'],
    queryFn: async () => {
      const items = await base44.entities.CommunityFeedback.list('-created_date', 100);
      return items.filter(item => item.is_visible || isAdmin);
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityFeedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['communityFeedback']);
      setFormData({ name: '', email: '', suggestion: '', category: 'general' });
      setShowForm(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: ({ id, currentUpvotes }) => 
      base44.entities.CommunityFeedback.update(id, { upvotes: currentUpvotes + 1 }),
    onSuccess: () => queryClient.invalidateQueries(['communityFeedback'])
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.CommunityFeedback.update(id, { is_visible: false }),
    onSuccess: () => queryClient.invalidateQueries(['communityFeedback'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <div className="py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-4">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Community-Driven</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Your Voice Matters
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Memory Mirror is built with community input at its heart. Share your suggestions, 
            ideas, and experiences to help us shape the future of dementia care.
          </p>
        </div>

        {submitSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <AlertDescription className="text-green-800 dark:text-green-400">
              Thank you! Your feedback has been submitted and will be visible to the community.
            </AlertDescription>
          </Alert>
        )}

        {!showForm ? (
          <div className="text-center mb-12">
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg min-h-[44px]"
            >
              <Send className="w-5 h-5 mr-2" />
              Share Your Feedback
            </Button>
          </div>
        ) : (
          <Card className="mb-12 shadow-xl border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle>Submit Your Feedback</CardTitle>
              <CardDescription>
                Your insights help us build better dementia care solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email (optional)</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="improvement">Improvement Idea</SelectItem>
                      <SelectItem value="testimonial">Testimonial / Success Story</SelectItem>
                      <SelectItem value="general">General Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Feedback *</label>
                  <Textarea
                    value={formData.suggestion}
                    onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                    placeholder="Share your thoughts, ideas, or experiences..."
                    rows={5}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="min-h-[44px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-h-[44px]"
                  >
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {isLoading ? (
            <div className="col-span-2 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : feedback.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Be the first to share your feedback!
              </p>
            </div>
          ) : (
            feedback.map((item) => {
              const Icon = categoryIcons[item.category] || MessageSquare;
              return (
                <Card key={item.id} className={`shadow-lg hover:shadow-xl transition-shadow ${!item.is_visible && isAdmin ? 'opacity-50 border-red-300' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryColors[item.category]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {new Date(item.created_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                            {!item.is_visible && isAdmin && (
                              <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
                                (Hidden)
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMutation.mutate(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 min-h-[44px] min-w-[44px]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                      {item.suggestion}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => upvoteMutation.mutate({ id: item.id, currentUpvotes: item.upvotes })}
                        className="gap-2 min-h-[44px]"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{item.upvotes || 0}</span>
                      </Button>
                      <span className={`text-xs px-3 py-1 rounded-full ${categoryColors[item.category]}`}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}