// app/api/cleanup-jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldJobs, cleanupJobsByStatus, getCleanupStats } from '@/lib/cleanup-old-jobs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'all', dryRun = false } = body;

    console.log(`🧹 Cleanup request received - Type: ${type}, Dry Run: ${dryRun}`);

    // Get stats before cleanup
    const statsBefore = await getCleanupStats();
    console.log('📊 Stats before cleanup:', statsBefore);

    let result;

    if (dryRun) {
      // Dry run - just return stats without deleting
      result = {
        dryRun: true,
        message: 'Dry run completed - no jobs were deleted',
        stats: statsBefore,
        wouldDelete: statsBefore.old
      };
    } else {
      // Actual cleanup
      if (type === 'status') {
        result = await cleanupJobsByStatus();
      } else {
        result = await cleanupOldJobs();
      }

      // Get stats after cleanup
      const statsAfter = await getCleanupStats();
      result.statsBefore = statsBefore;
      result.statsAfter = statsAfter;
    }

    console.log('✅ Cleanup completed:', result);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return NextResponse.json({
      error: 'Cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 