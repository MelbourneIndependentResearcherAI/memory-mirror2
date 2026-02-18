import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail, MessageSquare, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ShareButtons({ feedback }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/#/feedback`;
  const shareText = `Check out this feedback on Memory Mirror: "${feedback.title}" - ${feedback.rating} stars`;

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    toast.success('Opening Facebook...');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    toast.success('Opening Twitter...');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    toast.success('Opening LinkedIn...');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Memory Mirror Feedback');
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}\n\n${feedback.content}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success('Opening email client...');
  };

  const shareViaSMS = () => {
    const body = encodeURIComponent(`${shareText}\n${shareUrl}`);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `sms:?body=${body}`;
      toast.success('Opening messages...');
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const textToCopy = `${shareText}\n${shareUrl}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Memory Mirror Feedback',
          text: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={nativeShare}
        variant="outline"
        size="sm"
        className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
      >
        <Share2 className="w-4 h-4 mr-1" />
        Share
      </Button>

      <Button
        onClick={shareToFacebook}
        variant="outline"
        size="sm"
        className="text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
      >
        <Facebook className="w-4 h-4" />
      </Button>

      <Button
        onClick={shareToTwitter}
        variant="outline"
        size="sm"
        className="text-sky-500 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950"
      >
        <Twitter className="w-4 h-4" />
      </Button>

      <Button
        onClick={shareToLinkedIn}
        variant="outline"
        size="sm"
        className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
      >
        <Linkedin className="w-4 h-4" />
      </Button>

      <Button
        onClick={shareViaEmail}
        variant="outline"
        size="sm"
        className="text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Mail className="w-4 h-4" />
      </Button>

      <Button
        onClick={shareViaSMS}
        variant="outline"
        size="sm"
        className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
      >
        <MessageSquare className="w-4 h-4" />
      </Button>

      <Button
        onClick={copyToClipboard}
        variant="outline"
        size="sm"
        className="text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      </Button>
    </div>
  );
}