'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateCreditsInLocalStorage } from '@/lib/utils';

interface BlogResult {
  title: string;
  content: string;
  wordCount: number;
  images: string[];
  rating: {
    score: number;
    review: string;
  };
}

export default function BlogCreationForm() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [customTone, setCustomTone] = useState('');
  const [length, setLength] = useState('medium');
  const [includeHeadings, setIncludeHeadings] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingHTML, setIsDownloadingHTML] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [blogResult, setBlogResult] = useState<BlogResult | null>(null);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState(0);
  const [purchasedCredits, setPurchasedCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [canGenerate, setCanGenerate] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // Load and check credits on mount and when user changes
  useEffect(() => {
    const loadCredits = async () => {
      if (!user) {
        setLoadingCredits(false);
        return;
      }

      try {
        const response = await fetch('/api/check-credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: user.email }),
        });

        if (!response.ok) {
          throw new Error('Failed to load credits');
        }

        const creditInfo = await response.json();
        setCredits(creditInfo.freeCredits);
        setPurchasedCredits(creditInfo.purchasedCredits);
        setTotalCredits(creditInfo.totalCredits);
        setCanGenerate(creditInfo.canGenerate);

        // Update localStorage with current credit information
        updateCreditsInLocalStorage({
          freeCredits: creditInfo.freeCredits,
          purchasedCredits: creditInfo.purchasedCredits,
          totalCredits: creditInfo.totalCredits,
          lastUpdated: Date.now()
        });

      } catch (error) {
        console.error('Error loading credits:', error);
        setError('Failed to load credit information');
      } finally {
        setLoadingCredits(false);
      }
    };

    loadCredits();
  }, [user]);

  const generateBlog = async () => {
    if (!user) {
      setError('You must be logged in to generate blogs');
      return;
    }

    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    if (tone === 'others' && !customTone.trim()) {
      setError('Please enter a custom tone');
      return;
    }
    if (!canGenerate) {
      setError('You have no credits remaining. Credits reset every 24 hours.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setBlogResult(null);
    setProgress(0);
    setStatus('');

    try {
      // Use one credit
      const creditResponse = await fetch('/api/consume-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: user.email }),
      });

      if (!creditResponse.ok) {
        throw new Error('Failed to consume credit');
      }

      const creditData = await creditResponse.json();
      setCredits(creditData.freeCredits);
      setPurchasedCredits(creditData.purchasedCredits);
      setTotalCredits(creditData.remainingCredits);
      setCanGenerate(creditData.remainingCredits > 0);

      // Update localStorage with new credit information
      updateCreditsInLocalStorage({
        freeCredits: creditData.freeCredits,
        purchasedCredits: creditData.purchasedCredits,
        totalCredits: creditData.remainingCredits,
        lastUpdated: Date.now()
      });

      const response = await fetch('/api/generate-blog-async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          settings: {
            tone: tone === 'others' ? customTone.trim() : tone,
            length,
            includeHeadings,
            includeConclusion,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start blog generation');
      }

      const data = await response.json();
      setTrackingId(data.trackingId);
      setStatus('init');
      setProgress(0);

      // Start polling for status
      pollStatus(data.trackingId);

    } catch (err) {
      setError('Failed to start blog generation');
      setIsGenerating(false);
    }
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/blog-status/${id}`);
        const data = await response.json();

        if (response.ok) {
          setProgress(data.progress);
          setStatus(data.status);
          setStatus(data.message);

          if (data.status === 'completed') {
            setBlogResult({
              title: data.title,
              content: data.content,
              wordCount: data.wordCount,
              images: data.images || [],
              rating: data.rating,
            });
            setIsGenerating(false);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setError(data.message || 'Blog generation failed');
            setIsGenerating(false);
            clearInterval(interval);
          }
        } else {
          setError('Failed to check status');
          setIsGenerating(false);
          clearInterval(interval);
        }
      } catch (err) {
        setError('Failed to check status');
        setIsGenerating(false);
        clearInterval(interval);
      }
    }, 2000);
  };

  const downloadPDF = async () => {
    if (!blogResult) return;

    setIsDownloadingPDF(true);
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: blogResult.title,
          content: blogResult.content,
          wordCount: blogResult.wordCount,
          rating: blogResult.rating,
          images: blogResult.images,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${blogResult.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const downloadHTML = async () => {
    if (!blogResult) return;

    setIsDownloadingHTML(true);
    try {
      const response = await fetch('/api/download-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: blogResult.title,
          content: blogResult.content,
          wordCount: blogResult.wordCount,
          rating: blogResult.rating,
          images: blogResult.images,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate HTML');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${blogResult.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download HTML');
    } finally {
      setIsDownloadingHTML(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'inprogress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loadingCredits) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading credit information...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate AI Blog</CardTitle>
          <CardDescription>
            Create high-quality blog content with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Blog Topic</Label>
            <Input
              id="topic"
              placeholder="Enter your blog topic or idea..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <div className="flex flex-row items-center gap-2">
                <Select value={tone} onValueChange={setTone} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
                {tone === 'others' && (
                  <Input
                    className="ml-2 w-40"
                    placeholder="Custom tone"
                    value={customTone}
                    onChange={e => setCustomTone(e.target.value)}
                    disabled={isGenerating}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="headings"
                checked={includeHeadings}
                onCheckedChange={setIncludeHeadings}
                disabled={isGenerating}
              />
              <Label htmlFor="headings">Include Section Headings</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="conclusion"
                checked={includeConclusion}
                onCheckedChange={setIncludeConclusion}
                disabled={isGenerating}
              />
              <Label htmlFor="conclusion">Include Conclusion</Label>
            </div>
          </div>

          <div className="flex items-center justify-end mb-2 gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded bg-blue-900 text-blue-200`}>
              Free: {credits}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded bg-yellow-900 text-yellow-200`}>
              Purchased: {purchasedCredits}
            </span>
          </div>

          <Button 
            onClick={generateBlog} 
            disabled={isGenerating || !topic.trim() || !canGenerate}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Blog...
              </>
            ) : (
              'Generate Blog'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(status)}
              <span>Generating Blog...</span>
            </CardTitle>
            <CardDescription>{status}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
          </CardContent>
        </Card>
      )}

      {blogResult && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl text-white mb-2">{blogResult.title}</CardTitle>
                <CardDescription>
                  {blogResult.wordCount} words • AI Rating: {blogResult.rating.score}/10
                </CardDescription>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button 
                  onClick={downloadPDF} 
                  disabled={isDownloadingPDF}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isDownloadingPDF ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloadingPDF ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button 
                  onClick={downloadHTML} 
                  disabled={isDownloadingHTML}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isDownloadingHTML ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/><path d="M17 17h3a2 2 0 0 0 2-2v-3M17 17V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/></svg>
                  )}
                  {isDownloadingHTML ? 'Generating...' : 'Download HTML'}
                </Button>
              </div>
            </div>
            <hr className="my-4 border-gray-700" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-invert max-w-none bg-gray-900 text-white p-6 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2">AI Quality Review</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Score: {blogResult.rating.score}/10
                </Badge>
              </div>
              <p className="text-sm text-gray-300">{blogResult.rating.review}</p>
            </div>

            {blogResult.images && blogResult.images.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Suggested Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {blogResult.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Blog image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                          Click to view
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3">Blog Content</h3>
              <div 
                className="prose prose-invert max-w-none bg-gray-900 text-white p-6 rounded-lg border border-gray-700"
                dangerouslySetInnerHTML={{ __html: blogResult.content }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 