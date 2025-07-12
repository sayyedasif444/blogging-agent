import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';

// Initialize Firebase for real database operations
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const realDb = getFirestore(app);

// Helper functions for real database operations
export const findUserByEmailReal = async (email: string) => {
  try {
    console.log('Real Firebase: Finding user by email:', email);
    
    const usersRef = collection(realDb, 'blogtool_auth');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Real Firebase: User not found');
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('Real Firebase: User found with data:', userData);
    
    return {
      id: userDoc.id,
      data: () => userData,
      ref: userDoc.ref
    };
  } catch (error) {
    console.error('Real Firebase: Error finding user:', error);
    throw error;
  }
};

export const updateUserCreditsReal = async (userDoc: any, creditsToAdd: number, creditType: 'free' | 'purchased' = 'purchased') => {
  try {
    console.log(`Real Firebase: Adding ${creditsToAdd} ${creditType} credits`);
    
    const userData = userDoc.data();
    const currentFreeCredits = userData.freeCredits || 0;
    const currentPurchasedCredits = userData.purchasedCredits || 0;
    
    let newFreeCredits = currentFreeCredits;
    let newPurchasedCredits = currentPurchasedCredits;
    
    if (creditType === 'purchased') {
      newPurchasedCredits += creditsToAdd;
    } else {
      newFreeCredits += creditsToAdd;
    }
    
    await updateDoc(userDoc.ref, {
      freeCredits: newFreeCredits,
      purchasedCredits: newPurchasedCredits,
      totalCredits: newFreeCredits + newPurchasedCredits,
      lastUpdated: new Date()
    });
    
    console.log('Real Firebase: Credits updated successfully');
    console.log(`New credits - Free: ${newFreeCredits}, Purchased: ${newPurchasedCredits}, Total: ${newFreeCredits + newPurchasedCredits}`);
    
  } catch (error) {
    console.error('Real Firebase: Error updating credits:', error);
    throw error;
  }
};

export const consumeCreditsReal = async (userDoc: any, creditsToUse: number = 1): Promise<boolean> => {
  try {
    console.log(`Real Firebase: Consuming ${creditsToUse} credits`);
    
    const userData = userDoc.data();
    
    // Check if free credits need to be reset (24 hours)
    const now = new Date();
    
    // Handle cases where lastFreeCreditReset might be undefined or null
    if (!userData.lastFreeCreditReset) {
      // If no reset time exists, initialize it and reset credits
      console.log('Real Firebase: No reset time found, initializing and resetting credits');
      await updateDoc(userDoc.ref, {
        freeCredits: 2,
        lastFreeCreditReset: now,
        totalCredits: 2 + (userData.purchasedCredits || 0),
        lastUpdated: now
      });
      
      // Set current credits to reset values
      userData.freeCredits = 2;
      userData.purchasedCredits = userData.purchasedCredits || 0;
    } else {
      const lastReset = userData.lastFreeCreditReset instanceof Date 
        ? userData.lastFreeCreditReset 
        : new Date((userData.lastFreeCreditReset as any).seconds * 1000);
      
      const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceReset >= 24) {
        // Reset free credits to 2
        console.log('Real Firebase: Resetting free credits before consumption');
        userData.freeCredits = 2;
      }
    }
    
    let currentFreeCredits = userData.freeCredits || 0;
    let currentPurchasedCredits = userData.purchasedCredits || 0;
    
    const totalCredits = currentFreeCredits + currentPurchasedCredits;
    
    if (totalCredits < creditsToUse) {
      console.log('Real Firebase: Insufficient credits');
      return false;
    }
    
    let newFreeCredits = currentFreeCredits;
    let newPurchasedCredits = currentPurchasedCredits;
    
    // Use free credits first, then purchased credits
    if (currentFreeCredits >= creditsToUse) {
      newFreeCredits -= creditsToUse;
      console.log(`Real Firebase: Used ${creditsToUse} free credits. Remaining free: ${newFreeCredits}`);
    } else {
      const remainingFromFree = currentFreeCredits;
      const neededFromPurchased = creditsToUse - remainingFromFree;
      
      newFreeCredits = 0;
      newPurchasedCredits -= neededFromPurchased;
      
      console.log(`Real Firebase: Used ${remainingFromFree} free credits and ${neededFromPurchased} purchased credits`);
    }
    
    const updateData: any = {
      freeCredits: newFreeCredits,
      purchasedCredits: newPurchasedCredits,
      totalCredits: newFreeCredits + newPurchasedCredits,
      lastUpdated: now
    };
    
    // Update lastFreeCreditReset if it was missing or if credits were reset
    if (!userData.lastFreeCreditReset) {
      updateData.lastFreeCreditReset = now;
    }
    
    await updateDoc(userDoc.ref, updateData);
    
    console.log('Real Firebase: Credits consumed successfully');
    return true;
    
  } catch (error) {
    console.error('Real Firebase: Error consuming credits:', error);
    return false;
  }
};

export const getCurrentUserCreditsReal = async (email: string) => {
  try {
    const userDoc = await findUserByEmailReal(email);
    if (!userDoc) {
      return { free: 0, purchased: 0, total: 0 };
    }
    
    const userData = userDoc.data();
    
    // Check if free credits need to be reset (24 hours)
    const now = new Date();
    
    // Handle cases where lastFreeCreditReset might be undefined or null
    if (!userData.lastFreeCreditReset) {
      // If no reset time exists, initialize it and reset credits
      console.log('Real Firebase: No reset time found, initializing and resetting credits');
      await updateDoc(userDoc.ref, {
        freeCredits: 2,
        lastFreeCreditReset: now,
        totalCredits: 2 + (userData.purchasedCredits || 0),
        lastUpdated: now
      });
      
      return {
        free: 2,
        purchased: userData.purchasedCredits || 0,
        total: 2 + (userData.purchasedCredits || 0)
      };
    }
    
    const lastReset = userData.lastFreeCreditReset instanceof Date 
      ? userData.lastFreeCreditReset 
      : new Date((userData.lastFreeCreditReset as any).seconds * 1000);
    
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 24) {
      // Reset free credits to 2
      console.log('Real Firebase: Resetting free credits after 24 hours');
      await updateDoc(userDoc.ref, {
        freeCredits: 2,
        lastFreeCreditReset: now,
        totalCredits: 2 + (userData.purchasedCredits || 0),
        lastUpdated: now
      });
      
      return {
        free: 2,
        purchased: userData.purchasedCredits || 0,
        total: 2 + (userData.purchasedCredits || 0)
      };
    }
    
    return {
      free: userData.freeCredits || 0,
      purchased: userData.purchasedCredits || 0,
      total: (userData.freeCredits || 0) + (userData.purchasedCredits || 0)
    };
  } catch (error) {
    console.error('Real Firebase: Error getting credits:', error);
    return { free: 0, purchased: 0, total: 0 };
  }
}; 

export const initializeUserCredits = async (email: string) => {
  try {
    console.log('Real Firebase: Initializing user credits for:', email);
    
    const userDoc = await findUserByEmailReal(email);
    
    if (userDoc) {
      // User exists, check if they have the new credit structure
      const userData = userDoc.data();
      
      if (userData.freeCredits === undefined || userData.purchasedCredits === undefined) {
        // User exists but doesn't have the new credit structure, update them
        console.log('Real Firebase: Updating existing user with new credit structure');
        
        await updateDoc(userDoc.ref, {
          freeCredits: 2,
          purchasedCredits: 0,
          totalCredits: 2,
          lastFreeCreditReset: new Date(),
          lastUpdated: new Date()
        });
        
        console.log('Real Firebase: User updated with new credit structure');
      } else {
        console.log('Real Firebase: User already has new credit structure');
      }
    } else {
      // User doesn't exist, create them
      console.log('Real Firebase: Creating new user with credit structure');
      
      const usersRef = collection(realDb, 'blogtool_auth');
      await addDoc(usersRef, {
        email: email.toLowerCase(),
        freeCredits: 2,
        purchasedCredits: 0,
        totalCredits: 2,
        lastFreeCreditReset: new Date(),
        lastUpdated: new Date(),
        createdAt: new Date()
      });
      
      console.log('Real Firebase: New user created with credit structure');
    }
    
    return true;
  } catch (error) {
    console.error('Real Firebase: Error initializing user credits:', error);
    throw error;
  }
}; 

export const getNextResetTime = async (email: string): Promise<Date | null> => {
  try {
    const userDoc = await findUserByEmailReal(email);
    if (!userDoc) {
      return null;
    }
    
    const userData = userDoc.data();
    
    // Handle cases where lastFreeCreditReset might be undefined or null
    if (!userData.lastFreeCreditReset) {
      // If no reset time exists, set next reset to 24 hours from now
      const nextReset = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return nextReset;
    }
    
    const lastReset = userData.lastFreeCreditReset instanceof Date 
      ? userData.lastFreeCreditReset 
      : new Date((userData.lastFreeCreditReset as any).seconds * 1000);
    
    // Next reset is 24 hours after last reset
    const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
    return nextReset;
  } catch (error) {
    console.error('Real Firebase: Error getting next reset time:', error);
    return null;
  }
}; 