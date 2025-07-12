'use client';

import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading BlogTool
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
} 