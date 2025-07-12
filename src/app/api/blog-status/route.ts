import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus, getAllJobs } from '@/lib/blog-job-manager';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get('trackingId');

  try {
    if (trackingId) {
      // Get specific job status
      const job = await getJobStatus(trackingId);
      
      if (job.error) {
        return NextResponse.json({ error: job.error }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        job
      });
    } else {
      // Get all jobs
      const jobs = await getAllJobs();
      
      return NextResponse.json({
        success: true,
        jobs,
        total: jobs.length
      });
    }

  } catch (error) {
    console.error('❌ Failed to get job status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Failed to get job status.',
      details: errorMessage 
    }, { status: 500 });
  }
} 