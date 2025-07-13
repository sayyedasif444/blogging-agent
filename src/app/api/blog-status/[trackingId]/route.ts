import { NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/blog-job-manager';

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

    const job = await getJobStatus(trackingId);

    if (job.error) {
      return NextResponse.json(
        { error: job.error },
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