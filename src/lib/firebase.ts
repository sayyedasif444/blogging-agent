import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Check if Firebase config is available
const hasFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseConfig = hasFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} : null;

// Initialize Firebase if config is available
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (hasFirebaseConfig && firebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.error('❌ Firebase config not found. Please check your environment variables.');
}

// User management functions
export interface UserData {
  email: string;
  password: string;
  phone: string;            // Required phone number for Razorpay
  freeCredits: number;      // Free credits (reset every 24 hours)
  purchasedCredits: number;  // Purchased credits (never reset)
  resetTime: Date;
  lastFreeCreditReset?: Date; // Last time free credits were reset
  lastUpdated?: Date;        // Last time credits were updated
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthUser {
  email: string;
  phone: string;            // Required phone number for Razorpay
  freeCredits: number;      // Free credits (reset every 24 hours)
  purchasedCredits: number;  // Purchased credits (never reset)
  resetTime: Date;
  lastFreeCreditReset?: Date; // Last time free credits were reset
  lastUpdated?: Date;        // Last time credits were updated
  createdAt: Date;
  lastLoginAt: Date;
}

export const createUser = async (email: string, password: string, phone: string): Promise<AuthUser> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  if (!phone || !phone.trim()) {
    throw new Error('Phone number is required');
  }

  try {
    // Check if user already exists
    const existingUserQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', email.toLowerCase())
    );
    const existingUserSnapshot = await getDocs(existingUserQuery);
    
    if (!existingUserSnapshot.empty) {
      throw new Error('User with this email already exists');
    }

    // Create user document in Firestore
    const userData: Omit<UserData, 'createdAt' | 'lastLoginAt'> = {
      email: email.toLowerCase(),
      password: password, // In production, this should be hashed
      phone: phone.trim(), // Store phone number
      freeCredits: 2, // Start with 2 free credits
      purchasedCredits: 0, // Start with 0 purchased credits
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };

    const docRef = await addDoc(collection(db, 'blogtool_auth'), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    // Return user data without password
    return {
      email: userData.email,
      phone: userData.phone,
      freeCredits: userData.freeCredits,
      purchasedCredits: userData.purchasedCredits || 0,
      resetTime: userData.resetTime,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const signInUser = async (email: string, password: string): Promise<AuthUser> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    // Query for user with provided email
    const userQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', email.toLowerCase())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      throw new Error('Invalid email or password');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data() as UserData;

    // Check password
    if (userData.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Update last login time
    await updateDoc(doc(db, 'blogtool_auth', userSnapshot.docs[0].id), {
      lastLoginAt: new Date(),
    });

    // Return user data without password
    const authUser: AuthUser = {
      email: userData.email,
      phone: userData.phone,
      freeCredits: userData.freeCredits,
      purchasedCredits: userData.purchasedCredits || 0,
      resetTime: userData.resetTime,
      createdAt: userData.createdAt,
      lastLoginAt: new Date(),
    };
    return authUser;
  } catch (error: any) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  // For custom auth, we just clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('blogtool_user');
  }
};

export const getUserData = async (email: string): Promise<UserData | null> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const userQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', email.toLowerCase())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      return null;
    }

    return userSnapshot.docs[0].data() as UserData;
  } catch (error: any) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const updateUserCredits = async (email: string, newCredits: number): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const userQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', email.toLowerCase())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      throw new Error('User not found');
    }

    await updateDoc(doc(db, 'blogtool_auth', userSnapshot.docs[0].id), {
      freeCredits: newCredits,
    });
  } catch (error: any) {
    console.error('Error updating user credits:', error);
    throw error;
  }
};

export const resetUserCredits = async (email: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const userQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', email.toLowerCase())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      throw new Error('User not found');
    }

    const newResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    await updateDoc(doc(db, 'blogtool_auth', userSnapshot.docs[0].id), {
      freeCredits: 2,
      resetTime: newResetTime,
    });
  } catch (error: any) {
    console.error('Error resetting user credits:', error);
    throw error;
  }
};

export const checkAndUpdateCredits = async (email: string): Promise<{ credits: number; purchasedCredits: number; totalCredits: number; canGenerate: boolean }> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const userData = await getUserData(email);
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
      await resetUserCredits(email);
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

export const consumeCredits = async (email: string): Promise<number> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const userData = await getUserData(email);
    if (!userData) {
      throw new Error('User data not found');
    }

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

    // Update both credit types in the database
    const userQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', email.toLowerCase())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      throw new Error('User not found');
    }

    const newTotalCredits = newFreeCredits + newPurchasedCredits;

    await updateDoc(doc(db, 'blogtool_auth', userSnapshot.docs[0].id), {
      freeCredits: newFreeCredits,
      purchasedCredits: newPurchasedCredits,
      totalCredits: newTotalCredits,
    });

    return newTotalCredits;
  } catch (error: any) {
    console.error('Error using credits:', error);
    throw error;
  }
};

export const updatePurchasedCredits = async (email: string, creditsToAdd: number): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  try {
    const userQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', email.toLowerCase())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      throw new Error('User not found');
    }

    const userData = userSnapshot.docs[0].data() as UserData;
    const currentPurchasedCredits = userData.purchasedCredits || 0;
    const newPurchasedCredits = currentPurchasedCredits + creditsToAdd;
    const newTotalCredits = (userData.freeCredits || 0) + newPurchasedCredits;

    await updateDoc(doc(db, 'blogtool_auth', userSnapshot.docs[0].id), {
      purchasedCredits: newPurchasedCredits,
      totalCredits: newTotalCredits,
    });

    console.log(`Updated purchased credits for ${email}: ${currentPurchasedCredits} + ${creditsToAdd} = ${newPurchasedCredits}, Total: ${newTotalCredits}`);
  } catch (error: any) {
    console.error('Error updating purchased credits:', error);
    throw error;
  }
};

// Local storage management for session
export const storeUserSession = (user: AuthUser) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('blogtool_user', JSON.stringify({
      ...user,
      authenticated: true,
      authenticatedAt: new Date().toISOString()
    }));
  }
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem('blogtool_user');
    if (!userData) return null;

    const parsedData = JSON.parse(userData);
    if (!parsedData.authenticated) return null;

    return parsedData;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

export const clearUserSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('blogtool_user');
  }
};

export { app, db }; 