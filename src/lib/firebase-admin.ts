import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminApp: App | undefined;
let adminDb: Firestore | undefined;

try {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    adminApp = getApps()[0];
  }
  
  adminDb = getFirestore(adminApp);
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization error:', error);
}

export interface UserData {
  email: string;
  password: string;
  freeCredits: number;      // Free credits (reset every 24 hours)
  purchasedCredits: number;  // Purchased credits (never reset)
  resetTime: Date;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthUser {
  email: string;
  freeCredits: number;      // Free credits (reset every 24 hours)
  purchasedCredits: number;  // Purchased credits (never reset)
  resetTime: Date;
  createdAt: Date;
  lastLoginAt: Date;
}

export const getUserDataAdmin = async (email: string): Promise<UserData | null> => {
  if (!adminDb) {
    throw new Error('Firebase Admin is not initialized');
  }

  try {
    const userQuery = adminDb.collection('blogtool_auth').where('email', '==', email.toLowerCase());
    const userSnapshot = await userQuery.get();
    
    if (userSnapshot.empty) {
      return null;
    }

    const userData = userSnapshot.docs[0].data() as UserData;
    return userData;
  } catch (error: any) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const updatePurchasedCreditsAdmin = async (email: string, creditsToAdd: number): Promise<void> => {
  if (!adminDb) {
    throw new Error('Firebase Admin is not initialized');
  }

  try {
    const userQuery = adminDb.collection('blogtool_auth').where('email', '==', email.toLowerCase());
    const userSnapshot = await userQuery.get();
    
    if (userSnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data() as UserData;
    const currentPurchasedCredits = userData.purchasedCredits || 0;
    const newPurchasedCredits = currentPurchasedCredits + creditsToAdd;

    await userDoc.ref.update({
      purchasedCredits: newPurchasedCredits,
    });

    console.log(`Updated purchased credits for ${email}: ${currentPurchasedCredits} + ${creditsToAdd} = ${newPurchasedCredits}`);
  } catch (error: any) {
    console.error('Error updating purchased credits:', error);
    throw error;
  }
};

export const consumeCreditsAdmin = async (email: string): Promise<number> => {
  if (!adminDb) {
    throw new Error('Firebase Admin is not initialized');
  }

  try {
    const userQuery = adminDb.collection('blogtool_auth').where('email', '==', email.toLowerCase());
    const userSnapshot = await userQuery.get();
    
    if (userSnapshot.empty) {
      throw new Error('User not found');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data() as UserData;
    
    const totalCredits = (userData.freeCredits || 0) + (userData.purchasedCredits || 0);
    if (totalCredits <= 0) {
      throw new Error('No credits remaining');
    }

    // Use purchased credits first, then free credits
    let newFreeCredits = userData.freeCredits || 0;
    let newPurchasedCredits = userData.purchasedCredits || 0;

    if (newPurchasedCredits > 0) {
      newPurchasedCredits -= 1;
      console.log(`Used 1 purchased credit. Remaining purchased: ${newPurchasedCredits}`);
    } else {
      newFreeCredits -= 1;
      console.log(`Used 1 free credit. Remaining free: ${newFreeCredits}`);
    }

    await userDoc.ref.update({
      freeCredits: newFreeCredits,
      purchasedCredits: newPurchasedCredits,
    });

    return newFreeCredits + newPurchasedCredits;
  } catch (error: any) {
    console.error('Error using credits:', error);
    throw error;
  }
};

export const checkAndUpdateCreditsAdmin = async (email: string): Promise<{ credits: number; purchasedCredits: number; totalCredits: number; canGenerate: boolean }> => {
  if (!adminDb) {
    throw new Error('Firebase Admin is not initialized');
  }

  try {
    const userData = await getUserDataAdmin(email);
    if (!userData) {
      throw new Error('User data not found');
    }

    const now = new Date();
    // Handle Firestore timestamp conversion
    const resetTime = userData.resetTime instanceof Date 
      ? userData.resetTime 
      : new Date((userData.resetTime as any).seconds * 1000);

    // Check if credits should be reset
    if (now >= resetTime) {
      // Reset free credits to 2
      const userQuery = adminDb.collection('blogtool_auth').where('email', '==', email.toLowerCase());
      const userSnapshot = await userQuery.get();
      
      if (!userSnapshot.empty) {
        const newResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        await userSnapshot.docs[0].ref.update({
          freeCredits: 2,
          resetTime: newResetTime,
        });
      }
      
      return { 
        credits: 2, 
        purchasedCredits: userData.purchasedCredits || 0,
        totalCredits: 2 + (userData.purchasedCredits || 0),
        canGenerate: true 
      };
    }

    const freeCredits = userData.freeCredits || 0;
    const purchasedCredits = userData.purchasedCredits || 0;
    const totalCredits = freeCredits + purchasedCredits;

    return { 
      credits: freeCredits, 
      purchasedCredits: purchasedCredits,
      totalCredits: totalCredits,
      canGenerate: totalCredits > 0 
    };
  } catch (error: any) {
    console.error('Error checking credits:', error);
    throw error;
  }
};

export { adminDb }; 