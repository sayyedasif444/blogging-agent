'use client';

import { useState, useEffect } from 'react';

interface BlogEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  topic: string;
}

interface BlogHistoryProps {
  onSelectBlog: (blog: BlogEntry) => void;
  currentBlogId?: string;
}

export default function BlogHistory({ onSelectBlog, currentBlogId }: BlogHistoryProps) {
  const [blogs, setBlogs] = useState<BlogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load blogs from localStorage
    const savedBlogs = localStorage.getItem('blogHistory');
    if (savedBlogs) {
      try {
        setBlogs(JSON.parse(savedBlogs));
      } catch (error) {
        console.error('Failed to parse saved blogs:', error);
      }
    }
  }, []);

  const saveBlog = (blog: Omit<BlogEntry, 'id' | 'createdAt'>) => {
    const newBlog: BlogEntry = {
      ...blog,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedBlogs = [newBlog, ...blogs].slice(0, 10); // Keep only last 10 blogs
    setBlogs(updatedBlogs);
    localStorage.setItem('blogHistory', JSON.stringify(updatedBlogs));
  };

  const deleteBlog = (id: string) => {
    const updatedBlogs = blogs.filter(blog => blog.id !== id);
    setBlogs(updatedBlogs);
    localStorage.setItem('blogHistory', JSON.stringify(updatedBlogs));
  };

  const clearHistory = () => {
    setBlogs([]);
    localStorage.removeItem('blogHistory');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History ({blogs.length})
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Blog History</h3>
              {blogs.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {blogs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No blogs saved yet</p>
                <p className="text-xs">Your generated blogs will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                      currentBlogId === blog.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                    }`}
                    onClick={() => onSelectBlog(blog)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {blog.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {truncateText(blog.topic, 40)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(blog.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlog(blog.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Export a function to save blogs from other components
export const saveBlogToHistory = (blog: Omit<BlogEntry, 'id' | 'createdAt'>) => {
  const savedBlogs = localStorage.getItem('blogHistory');
  const blogs: BlogEntry[] = savedBlogs ? JSON.parse(savedBlogs) : [];
  
  const newBlog: BlogEntry = {
    ...blog,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const updatedBlogs = [newBlog, ...blogs].slice(0, 10);
  localStorage.setItem('blogHistory', JSON.stringify(updatedBlogs));
}; 