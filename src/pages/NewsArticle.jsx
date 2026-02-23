import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const categoryColors = {
  research: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  caregiving: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  lifestyle: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  breakthrough: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  community: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
};

export default function NewsArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading } = useQuery({
    queryKey: ['newsArticle', id],
    queryFn: async () => {
      const articles = await base44.entities.NewsArticle.list();
      return articles.find(a => a.id === id);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-8 flex items-center justify-center">
        <p className="text-xl text-slate-600 dark:text-slate-400">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">Article not found</p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="overflow-hidden">
          {article.featured_image && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardContent className="p-8 md:p-12">
            <div className="mb-6">
              <Badge className={categoryColors[article.category] || categoryColors.research}>
                {article.category}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
                {article.subtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
              )}
              {article.publish_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(article.publish_date), 'MMMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{article.view_count || 0} views</span>
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-8">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-6">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 italic my-6 text-slate-600 dark:text-slate-400">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, ...props }) => (
                    <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  Tags:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}