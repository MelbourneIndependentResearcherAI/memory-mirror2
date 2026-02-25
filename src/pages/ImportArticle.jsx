import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function ImportArticle() {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: 'research',
    author: '',
    tags: '',
    featured_image: ''
  });
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createArticleMutation = useMutation({
    mutationFn: (data) => base44.entities.NewsArticle.create(data),
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['newsArticles'] });
      toast.success('Article imported successfully!');
      setTimeout(() => navigate(`/NewsArticle/${article.id}`), 1000);
    },
    onError: () => {
      toast.error('Failed to import article');
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    }
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info('Uploading image...');
    try {
      const fileUrl = await uploadImageMutation.mutateAsync(file);
      setFormData({ ...formData, featured_image: fileUrl });
      toast.success('Image uploaded!');
    } catch (_error) {
      toast.error('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setImporting(true);

    const articleData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      publish_date: new Date().toISOString().split('T')[0],
      is_published: true,
      view_count: 0
    };

    createArticleMutation.mutate(articleData);
    setImporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Import Article
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Add news, research, or educational content to Memory Mirror
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article title..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Brief summary..."
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="caregiving">Caregiving</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="breakthrough">Breakthrough</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name..."
                />
              </div>

              <div>
                <Label htmlFor="content">Content * (Markdown supported)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your article content here... You can use Markdown formatting."
                  rows={15}
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Supports Markdown: **bold**, *italic*, # heading, - lists, etc.
                </p>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="dementia, care, research, alzheimers"
                />
              </div>

              <div>
                <Label htmlFor="image">Featured Image</Label>
                <div className="mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.featured_image && (
                    <div className="mt-4">
                      <img
                        src={formData.featured_image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={importing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {importing ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Import Article
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Tip:</strong> Imported articles appear in the news feed and can be shared with family members. 
                Use clear, accessible language suitable for dementia care contexts. Include sources and citations where appropriate.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}