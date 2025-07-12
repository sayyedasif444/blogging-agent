'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface BlogProgressProps {
  trackingId: string;
  onComplete: (blog: { title: string; content: string }) => void;
  onError: (error: string) => void;
}

interface JobStatus {
  status: 'init' | 'inprogress' | 'completed' | 'failed';
  progress: number;
  message: string;
  title?: string;
  content?: string;
  error?: string;
}

export default function BlogProgress({ trackingId, onComplete, onError }: BlogProgressProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/blog-status?trackingId=${trackingId}`);
        const data = await response.json();

        if (data.success && data.job) {
          const job = data.job;
          setJobStatus(job);

          if (job.status === 'completed' && job.title && job.content) {
            setIsPolling(false);
            onComplete({ title: job.title, content: job.content });
          } else if (job.status === 'failed') {
            setIsPolling(false);
            onError(job.error || 'Blog generation failed');
          }
        } else {
          throw new Error(data.error || 'Failed to get job status');
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setIsPolling(false);
        onError('Failed to check generation status');
      }
    };

    // Poll immediately
    pollStatus();

    // Set up polling interval
    const interval = setInterval(() => {
      if (isPolling) {
        pollStatus();
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [trackingId, isPolling, onComplete, onError]);

  if (!jobStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Initializing...</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'inprogress':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'inprogress':
        return <LoadingSpinner size="sm" className="text-blue-600 dark:text-blue-400" />;
      default:
        return (
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generating Blog</h2>
        <div className={`flex items-center gap-2 ${getStatusColor(jobStatus.status)}`}>
          {getStatusIcon(jobStatus.status)}
          <span className="text-sm font-medium capitalize">{jobStatus.status}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{jobStatus.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${jobStatus.progress}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300">{jobStatus.message}</p>
      </div>

      {/* Generation Steps */}
      <div className="space-y-3">
        <div className={`flex items-center gap-3 ${jobStatus.progress >= 20 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            jobStatus.progress >= 20 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {jobStatus.progress >= 20 ? '✓' : '1'}
          </div>
          <span className="text-sm">Generating title</span>
        </div>

        <div className={`flex items-center gap-3 ${jobStatus.progress >= 60 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            jobStatus.progress >= 60 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {jobStatus.progress >= 60 ? '✓' : '2'}
          </div>
          <span className="text-sm">Writing content</span>
        </div>

        <div className={`flex items-center gap-3 ${jobStatus.progress >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
            jobStatus.progress >= 100 ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {jobStatus.progress >= 100 ? '✓' : '3'}
          </div>
          <span className="text-sm">Finalizing</span>
        </div>
      </div>

      {jobStatus.status === 'failed' && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">
            <strong>Error:</strong> {jobStatus.error}
          </p>
        </div>
      )}
    </div>
  );
} 