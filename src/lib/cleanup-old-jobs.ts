// lib/cleanup-old-jobs.ts
import { realDb as db } from './firebase-real';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface JobData {
  trackingId: string;
  status: string;
  updatedAt: string;
}

interface CleanupResult {
  deleted: number;
  message: string;
  deletedJobs?: JobData[];
  breakdown?: {
    completed: number;
    failed: number;
    abandoned: number;
  };
  statsBefore?: CleanupStats;
  statsAfter?: CleanupStats;
}

interface CleanupStats {
  total: number;
  old: number;
  byStatus: {
    init: number;
    inprogress: number;
    completed: number;
    failed: number;
  };
  oldByStatus: {
    init: number;
    inprogress: number;
    completed: number;
    failed: number;
  };
}

/**
 * Cleanup script to remove old job data from Firebase
 * Removes jobs that haven't been updated in the last 24 hours
 */
export async function cleanupOldJobs(): Promise<CleanupResult> {
  try {
    console.log('🧹 Starting cleanup of old jobs...');
    
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    console.log(`🗑️ Looking for jobs older than: ${twentyFourHoursAgo.toISOString()}`);
    
    // Query for jobs that haven't been updated in the last 24 hours
    const jobsRef = collection(db, 'blog-jobs');
    const q = query(
      jobsRef,
      where('updatedAt', '<', twentyFourHoursAgo.toISOString())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('✅ No old jobs found to clean up');
      return { deleted: 0, message: 'No old jobs found' };
    }
    
    console.log(`📋 Found ${querySnapshot.size} old jobs to delete`);
    
    const deletePromises: Promise<void>[] = [];
    const deletedJobs: JobData[] = [];
    
    querySnapshot.forEach((doc) => {
      const jobData = doc.data();
      deletedJobs.push({
        trackingId: jobData.trackingId,
        status: jobData.status,
        updatedAt: jobData.updatedAt
      });
      
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    // Delete all old jobs
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${deletedJobs.length} old jobs`);
    console.log('Deleted jobs:', deletedJobs.map(job => `${job.trackingId} (${job.status})`));
    
    return {
      deleted: deletedJobs.length,
      message: `Successfully deleted ${deletedJobs.length} old jobs`,
      deletedJobs
    };
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cleanup script with more specific criteria
 * Removes jobs based on status and age
 */
export async function cleanupJobsByStatus(): Promise<CleanupResult> {
  try {
    console.log('🧹 Starting status-based cleanup...');
    
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const jobsRef = collection(db, 'blog-jobs');
    
    // Clean up completed jobs older than 24 hours
    const completedQuery = query(
      jobsRef,
      where('status', '==', 'completed'),
      where('updatedAt', '<', twentyFourHoursAgo.toISOString())
    );
    
    // Clean up failed jobs older than 24 hours
    const failedQuery = query(
      jobsRef,
      where('status', '==', 'failed'),
      where('updatedAt', '<', twentyFourHoursAgo.toISOString())
    );
    
    // Clean up abandoned jobs (inprogress for more than 24 hours)
    const abandonedQuery = query(
      jobsRef,
      where('status', '==', 'inprogress'),
      where('updatedAt', '<', twentyFourHoursAgo.toISOString())
    );
    
    const [completedSnapshot, failedSnapshot, abandonedSnapshot] = await Promise.all([
      getDocs(completedQuery),
      getDocs(failedQuery),
      getDocs(abandonedQuery)
    ]);
    
    const totalJobs = completedSnapshot.size + failedSnapshot.size + abandonedSnapshot.size;
    
    if (totalJobs === 0) {
      console.log('✅ No old jobs found to clean up');
      return { deleted: 0, message: 'No old jobs found' };
    }
    
    console.log(`📋 Found ${totalJobs} old jobs to delete:`);
    console.log(`  - Completed: ${completedSnapshot.size}`);
    console.log(`  - Failed: ${failedSnapshot.size}`);
    console.log(`  - Abandoned: ${abandonedSnapshot.size}`);
    
    const deletePromises: Promise<void>[] = [];
    const deletedJobs: JobData[] = [];
    
    // Delete completed jobs
    completedSnapshot.forEach((doc) => {
      const jobData = doc.data();
      deletedJobs.push({
        trackingId: jobData.trackingId,
        status: 'completed',
        updatedAt: jobData.updatedAt
      });
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    // Delete failed jobs
    failedSnapshot.forEach((doc) => {
      const jobData = doc.data();
      deletedJobs.push({
        trackingId: jobData.trackingId,
        status: 'failed',
        updatedAt: jobData.updatedAt
      });
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    // Delete abandoned jobs
    abandonedSnapshot.forEach((doc) => {
      const jobData = doc.data();
      deletedJobs.push({
        trackingId: jobData.trackingId,
        status: 'abandoned',
        updatedAt: jobData.updatedAt
      });
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    // Delete all old jobs
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${deletedJobs.length} old jobs`);
    
    return {
      deleted: deletedJobs.length,
      message: `Successfully deleted ${deletedJobs.length} old jobs`,
      breakdown: {
        completed: completedSnapshot.size,
        failed: failedSnapshot.size,
        abandoned: abandonedSnapshot.size
      },
      deletedJobs
    };
    
  } catch (error) {
    console.error('❌ Error during status-based cleanup:', error);
    throw new Error(`Status-based cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get cleanup statistics
 */
export async function getCleanupStats(): Promise<CleanupStats> {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    
    const jobsRef = collection(db, 'blog-jobs');
    const snapshot = await getDocs(jobsRef);
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const stats: CleanupStats = {
      total: 0,
      old: 0,
      byStatus: {
        init: 0,
        inprogress: 0,
        completed: 0,
        failed: 0
      },
      oldByStatus: {
        init: 0,
        inprogress: 0,
        completed: 0,
        failed: 0
      }
    };
    
    snapshot.forEach((doc) => {
      const jobData = doc.data();
      stats.total++;
      const status = jobData.status as keyof typeof stats.byStatus;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      const updatedAt = new Date(jobData.updatedAt);
      if (updatedAt < twentyFourHoursAgo) {
        stats.old++;
        stats.oldByStatus[status] = (stats.oldByStatus[status] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting cleanup stats:', error);
    throw new Error(`Failed to get cleanup stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 