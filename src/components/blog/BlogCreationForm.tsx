'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BlogSettings from './BlogSettings';
import BlogProgress from './BlogProgress';

interface BlogSettings {
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  length: 'short' | 'medium' | 'long';
  includeHeadings: boolean;
  includeConclusion: boolean;
}

interface BlogCreationFormProps {
  onBlogGenerated: (blog: { title: string; content: string }) => void;
  creditsLeft?: number;
  onTopicChange?: (topic: string) => void;
}

const defaultSettings: BlogSettings = {
  tone: 'professional',
  length: 'medium',
  includeHeadings: true,
  includeConclusion: true,
};

export default function BlogCreationForm({ onBlogGenerated, creditsLeft = 2, onTopicChange }: BlogCreationFormProps) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<BlogSettings>(defaultSettings);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTopic = e.target.value;
    setTopic(newTopic);
    onTopicChange?.(newTopic);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError('');
    setTrackingId(null);

    try {
      const response = await fetch('/api/generate-blog-async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, settings }),
      });

      if (!response.ok) {
        throw new Error('Failed to start blog generation');
      }

      const data = await response.json();
      
      if (data.success && data.trackingId) {
        setTrackingId(data.trackingId);
      } else {
        throw new Error('Failed to get tracking ID');
      }
    } catch (err) {
      setError('Failed to start blog generation. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = (blog: { title: string; content: string }) => {
    setIsGenerating(false);
    setTrackingId(null);
    onBlogGenerated(blog);
  };

  const handleGenerationError = (errorMessage: string) => {
    setIsGenerating(false);
    setTrackingId(null);
    setError(errorMessage);
  };

  const handleCancel = () => {
    setIsGenerating(false);
    setTrackingId(null);
    setError('');
  };

  // Show progress component when generating
  if (isGenerating && trackingId) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <BlogProgress
          trackingId={trackingId}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
        />
        <div className="mt-4 text-center">
          <button
            onClick={handleCancel}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
          >
            Cancel Generation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Blog</h2>
        <div className="flex items-center gap-2">
          <BlogSettings settings={settings} onSettingsChange={setSettings} />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Credits left: <span className="font-semibold text-primary">{creditsLeft}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What would you like to write about?
          </label>
          <textarea
            id="topic"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Enter your blog topic or idea (e.g., 'The future of artificial intelligence and its impact on society')"
            value={topic}
            onChange={handleTopicChange}
            disabled={isGenerating}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Be specific and include any key points you'd like to cover
          </p>
        </div>

        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className={`flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              isGenerating || !topic.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Starting...
              </>
            ) : (
              'Generate Blog'
            )}
          </button>

          <button
            type="button"
            onClick={() => setTopic('')}
            disabled={isGenerating || !topic}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tips for great results:
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li>• Be specific about your topic</li>
          <li>• Include key points you want to cover</li>
          <li>• Mention your target audience if relevant</li>
          <li>• Use the settings to customize tone and length</li>
        </ul>
      </div>
    </div>
  );
} 