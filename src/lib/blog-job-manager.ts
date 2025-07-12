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
export const loadJobs = () => {
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
export const saveJobs = (jobs: any) => {
  ensureDataDir();
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error saving jobs:', error);
  }
};

// Helper function to update job status in file
export const updateJobStatus = async (trackingId: string, status: string, progress: number, message: string, data: any = {}) => {
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
};

// Helper function to remove job from file
export const removeJobFromFile = (trackingId: string) => {
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

// Helper function for status checking
export const getJobStatus = async (trackingId: string) => {
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
};

// Helper function for getting all jobs
export const getAllJobs = async () => {
  try {
    const jobs = loadJobs();
    const jobsArray = Object.values(jobs);
    
    // Sort by creation date (newest first)
    return jobsArray.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('❌ Error getting all jobs:', error);
    return [];
  }
}; 