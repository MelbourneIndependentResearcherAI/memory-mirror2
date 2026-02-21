import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function NewsArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['newsArticles'],
    queryFn: () => offlineEntities.list('NewsArticle', '-publish_date'),
  });

  const article = articleId 
    ? articles.find(a => a.id === articleId)
    : articles[0];

  useEffect(() => {
    if (article) {
      // Track view
      offlineEntities.update('NewsArticle', article.id, {
        view_count: (article.view_count || 0) + 1
      }).catch(() => {});
    }
  }, [article?.id]);

  const shareArticle = () => {
    const shareUrl = `${window.location.origin}${createPageUrl('NewsArticle')}?id=${article.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.subtitle || 'Read this important article about Alzheimer\'s care',
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Article link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="animate-pulse text-amber-600">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Article not found</h2>
        <Link to={createPageUrl('Landing')}>
          <Button>← Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-100 via-rose-100 to-amber-50 py-12 px-6 border-b-4 border-amber-300">
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl('Landing')}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 text-sm text-amber-700 mb-4">
            <span className="px-3 py-1 bg-amber-200 rounded-full font-medium">
              {article.category || 'News'}
            </span>
            {article.publish_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(article.publish_date).toLocaleDateString()}
              </span>
            )}
            {article.view_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.view_count} views
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-amber-800 mb-6 leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {article.author && (
            <p className="text-sm text-amber-700">By {article.author}</p>
          )}

          <Button 
            onClick={shareArticle}
            className="mt-6 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share This Article
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div 
          className="prose prose-lg prose-amber max-w-none
            prose-headings:text-amber-900 prose-headings:font-bold
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-amber-900 prose-strong:font-bold
            prose-blockquote:border-l-4 prose-blockquote:border-amber-400 
            prose-blockquote:bg-amber-50 prose-blockquote:py-4 prose-blockquote:px-6
            prose-blockquote:italic prose-blockquote:text-amber-900"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.tags?.length > 0 && (
          <div className="mt-12 pt-8 border-t border-amber-200">
            <h3 className="text-sm font-semibold text-amber-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
          <h3 className="text-xl font-bold text-green-900 mb-3">
            Try Memory Mirror
          </h3>
          <p className="text-green-800 mb-4 leading-relaxed">
            Experience the compassionate AI companion designed specifically for people living with dementia and their caregivers.
          </p>
          <Link to={createPageUrl('ChatMode')}>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              Start Using Memory Mirror →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}