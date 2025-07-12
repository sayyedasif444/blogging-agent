'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface BlogPreviewProps {
  blog: {
    title: string;
    content: string;
  } | null;
  onRegenerate?: () => void;
}

export default function BlogPreview({ blog, onRegenerate }: BlogPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: 'html' | 'pdf') => {
    if (!blog) return;

    setIsDownloading(true);

    try {
      if (format === 'html') {
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${blog.title}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                color: #333;
                background-color: #fff;
              }
              h1 {
                color: #1a1a1a;
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                border-bottom: 3px solid #3b82f6;
                padding-bottom: 0.5rem;
              }
              h2 {
                color: #1f2937;
                font-size: 1.5rem;
                font-weight: 600;
                margin-top: 2rem;
                margin-bottom: 1rem;
              }
              p {
                margin-bottom: 1rem;
                color: #374151;
              }
              ul, ol {
                margin-bottom: 1rem;
                padding-left: 1.5rem;
              }
              li {
                margin-bottom: 0.5rem;
                color: #374151;
              }
              blockquote {
                border-left: 4px solid #3b82f6;
                padding-left: 1rem;
                margin: 1.5rem 0;
                font-style: italic;
                color: #6b7280;
              }
              .blog-meta {
                color: #6b7280;
                font-size: 0.875rem;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <article>
              <h1>${blog.title}</h1>
              <div class="blog-meta">
                Generated with AI Blog Creator | ${new Date().toLocaleDateString()}
              </div>
              ${blog.content}
            </article>
          </body>
          </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // For PDF, we'll use a simple approach with jsPDF
        // In a real implementation, you might want to use a more robust PDF library
        alert('PDF download feature coming soon! For now, please use the HTML download option.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!blog) return;

    try {
      const textContent = `${blog.title}\n\n${blog.content.replace(/<[^>]*>/g, '')}`;
      await navigator.clipboard.writeText(textContent);
      alert('Blog content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  if (!blog) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Blog Generated Yet</h3>
          <p className="text-sm">Your generated blog post will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Preview</h2>
        <div className="flex gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-primary pb-2">
            {blog.title}
          </h1>
          <div 
            className="text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Download & Share
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleDownload('html')}
            disabled={isDownloading}
            className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Download HTML
          </button>
          
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isDownloading}
            className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Download PDF
          </button>
          
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Text
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p><strong>HTML:</strong> Perfect for web publishing and blogs</p>
          <p><strong>PDF:</strong> Great for sharing and printing (coming soon)</p>
          <p><strong>Copy Text:</strong> Plain text version for easy editing</p>
        </div>
      </div>
    </div>
  );
} 