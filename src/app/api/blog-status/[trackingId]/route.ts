import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File-based storage for blog generation jobs
const JOBS_FILE = path.join(process.cwd(), 'data', 'blog-jobs.json');

// Load jobs from file
const loadJobs = () => {
  const dataDir = path.dirname(JOBS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    const jobs = loadJobs();
    const job = jobs[trackingId];

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error('Error getting job status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to get job status', details: errorMessage },
      { status: 500 }
    );
  }
} 