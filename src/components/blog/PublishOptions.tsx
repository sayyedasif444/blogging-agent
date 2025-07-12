'use client';

import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface PublishOptionsProps {
  onDownloadHTML?: () => void;
  onDownloadPDF?: () => void;
  className?: string;
}

export default function PublishOptions({ onDownloadHTML, onDownloadPDF, className = '' }: PublishOptionsProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Download Your Blog
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
        Download your blog in your preferred format - HTML for web publishing or PDF for easy sharing.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={onDownloadHTML}
          className="flex flex-col items-center p-6 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary dark:hover:border-primary transition-colors group"
        >
          <DocumentTextIcon className="h-12 w-12 text-primary mb-4" />
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">HTML Format</div>
            <div className="text-gray-500 dark:text-gray-300">
              Perfect for web publishing
              <br />
              Maintains all formatting
            </div>
          </div>
        </button>

        <button
          onClick={onDownloadPDF}
          className="flex flex-col items-center p-6 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary dark:hover:border-primary transition-colors group"
        >
          <DocumentArrowDownIcon className="h-12 w-12 text-primary mb-4" />
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">PDF Format</div>
            <div className="text-gray-500 dark:text-gray-300">
              Ready to share & print
              <br />
              Professional layout
            </div>
          </div>
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Tips:</h4>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li className="flex items-center gap-2">
            <span className="block w-2 h-2 rounded-full bg-primary"></span>
            Choose HTML for website integration
          </li>
          <li className="flex items-center gap-2">
            <span className="block w-2 h-2 rounded-full bg-primary"></span>
            Choose PDF for email sharing or printing
          </li>
        </ul>
      </div>
    </div>
  );
} 