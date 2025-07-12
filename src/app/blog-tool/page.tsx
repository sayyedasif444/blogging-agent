'use client';

import BlogCreationForm from '@/components/BlogCreationForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogToolPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 text-white border-gray-600 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex gap-3">
            <Link href="/pricing">
              <Button variant="outline" className="flex items-center gap-2 text-white border-gray-600 hover:bg-gray-800">
                Pricing
              </Button>
            </Link>
            
            <a 
              href="https://devanddebate.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <ExternalLink className="h-4 w-4" />
                Visit Dev & Debate
              </Button>
            </a>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo-main.png"
              alt="Dev & Debate Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Dev & Debate - Blogging Tool
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Create engaging, high-quality blog posts with AI assistance. 
            Choose your topic, customize settings, and watch the magic happen.
          </p>
        </div>
        
        <BlogCreationForm />
      </div>
    </ProtectedRoute>
  );
} 