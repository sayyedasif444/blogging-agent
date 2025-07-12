import { NextResponse } from 'next/server';
import { getTrendingTopicFromIdea } from '@/lib/agents/getTrendingTopic';
import { writeBlogSections } from '@/lib/agents/writeBlogSections';
import { evaluateAndRateBlog } from '@/lib/agents/evaluateAndRateBlog';
import { rewriteBlogWithFeedback } from '@/lib/agents/rewriteBlog';
import { generateSearchQuery } from '@/lib/agents/generateImageSearchQuery';
import { findRelevantImages } from '@/lib/agents/findRelevantImages';
import fs from 'fs';
import path from 'path';

// TypeScript interfaces
interface BlogContent {
  html: string;
  wordCount: number;
}

interface BlogRating {
  score: number;
  review: string;
}

interface JobData {
  trackingId: string;
  topic: string;
  settings?: any;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  title: string | null;
  content: string | null;
  images: string[] | null;
  rating: BlogRating | null;
}

// File-based storage for blog generation jobs
const JOBS_FILE = path.join(process.cwd(), 'data', 'blog-jobs.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(JOBS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load jobs from file
const loadJobs = () => {
  ensureDataDir();
  if (!fs.existsSync(JOBS_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(JOBS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading jobs:', error);
    return {};
  }
};

// Save jobs to file
const saveJobs = (jobs: any) => {
  ensureDataDir();
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error saving jobs:', error);
  }
};

export async function POST(request: Request) {
  try {
    const { topic, settings } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate tracking ID
    const trackingId = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize job with status
    const initialJob = {
      trackingId,
      topic,
      settings,
      status: 'init',
      message: 'Initializing blog generation...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      title: null,
      content: null,
      images: null,
      rating: null
    };

    // Store initial job in file
    const jobs = loadJobs();
    jobs[trackingId] = initialJob;
    saveJobs(jobs);

    console.log(`🚀 Created job ${trackingId} for topic: ${topic}`);

    // Start async processing (don't await)
    processBlogGeneration(trackingId, topic, settings);

    // Return tracking ID immediately
    return NextResponse.json({
      success: true,
      trackingId,
      message: 'Blog generation started',
      status: 'init'
    });

  } catch (error) {
    console.error('❌ Failed to create blog generation job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create blog generation job', details: errorMessage },
      { status: 500 }
    );
  }
}

// Async blog generation function
async function processBlogGeneration(trackingId: string, topic: string, settings: any) {
  try {
    // Update status to in-progress
    await updateJobStatus(trackingId, 'inprogress', 10, 'Starting blog generation process...');
    console.log(`🔄 Starting blog generation for ${trackingId}`);

    // Step 1: Get trending topic (20% progress)
    await updateJobStatus(trackingId, 'inprogress', 20, 'Generating trending topic and title...');
    let title = await getTrendingTopicFromIdea(topic);
    console.log(`🔍 Generated title: ${title}`);

    if (!title) {
      console.log('⚠️ Title generation failed, using fallback title');
      title = `${topic} - A Comprehensive Guide`;
    }

    // Step 2: Write initial blog content (40% progress)
    await updateJobStatus(trackingId, 'inprogress', 40, 'Writing initial blog content...');
    let blog: BlogContent = await writeBlogSections(title, settings?.tone || 'professional', settings);
    console.log(`✍️ Initial blog written (${blog.wordCount} words)`);

    // Step 3: Evaluate blog (60% progress)
    await updateJobStatus(trackingId, 'inprogress', 60, 'Evaluating blog quality and content...');
    let rating: BlogRating = await evaluateAndRateBlog(blog.html, settings?.tone || 'professional');
    console.log(`📝 Blog rating: ${rating.score}/10`);

    // Step 4: Rewrite if needed (80% progress)
    if (rating.score < 8 || blog.wordCount < 500) {
      await updateJobStatus(trackingId, 'inprogress', 70, 'Rewriting blog to improve quality...');
      console.log('🔄 Rewriting blog due to low score or short content...');
      blog = await rewriteBlogWithFeedback(blog, rating.review, settings?.tone || 'professional', title);
      rating = await evaluateAndRateBlog(blog.html, settings?.tone || 'professional');
      console.log(`✅ Rewritten blog (${blog.wordCount} words, score: ${rating.score}/10)`);
    } else {
      await updateJobStatus(trackingId, 'inprogress', 70, 'Blog quality is good, skipping rewrite...');
    }

    // Step 5: Generate images (90% progress)
    await updateJobStatus(trackingId, 'inprogress', 90, 'Generating relevant images...');
    const searchQuery = await generateSearchQuery(title, blog.html);
    const images = await findRelevantImages(searchQuery);
    console.log(`🖼️ Generated ${images.length} images`);

    // Step 6: Complete (100% progress)
    await updateJobStatus(trackingId, 'completed', 100, 'Blog generation completed successfully!', {
      title,
      content: blog.html,
      wordCount: blog.wordCount,
      images,
      rating
    });

    console.log(`✅ Blog generation completed for ${trackingId}`);

  } catch (error) {
    console.error(`❌ Blog generation failed for ${trackingId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await updateJobStatus(trackingId, 'failed', 0, `Blog generation failed: ${errorMessage}`, { error: errorMessage });
  }
}

// Helper function to update job status in file
async function updateJobStatus(trackingId: string, status: string, progress: number, message: string, data: any = {}) {
  try {
    const jobs = loadJobs();
    if (jobs[trackingId]) {
      jobs[trackingId] = {
        ...jobs[trackingId],
        status,
        progress,
        message,
        updatedAt: new Date().toISOString(),
        ...data
      };
      saveJobs(jobs);
      console.log(`📊 Job ${trackingId}: ${status} (${progress}%) - ${message}`);
      
      // Remove completed or failed jobs after a delay
      if (status === 'completed' || status === 'failed') {
        setTimeout(() => {
          removeJobFromFile(trackingId);
        }, 30000); // Remove after 30 seconds
      }
    }
  } catch (error) {
    console.error(`❌ Failed to update job status for ${trackingId}:`, error);
  }
}

// Helper function to remove job from file
const removeJobFromFile = (trackingId: string) => {
  try {
    const jobs = loadJobs();
    if (jobs[trackingId]) {
      delete jobs[trackingId];
      saveJobs(jobs);
      console.log(`🗑️ Removed completed job ${trackingId} from file`);
    }
  } catch (error) {
    console.error(`❌ Failed to remove job ${trackingId} from file:`, error);
  }
};

// Export functions for status checking
export async function getJobStatus(trackingId: string) {
  try {
    const jobs = loadJobs();
    const job = jobs[trackingId];
    
    if (!job) {
      return { error: 'Job not found' };
    }
    
    return job;
  } catch (error) {
    console.error('❌ Error getting job status:', error);
    return { error: 'Failed to get job status' };
  }
}

export async function getAllJobs() {
  try {
    const jobs = loadJobs();
    const jobsArray = Object.values(jobs);
    
    // Sort by creation date (newest first)
    return jobsArray.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('❌ Error getting all jobs:', error);
    return [];
  }
} 