// Mock Firebase implementation for testing payment flow
// This will be replaced with proper Firebase integration once the SDK issues are resolved

interface MockUser {
  id: string;
  email: string;
  freeCredits: number;      // Free trial credits (reset after 24 hours)
  purchasedCredits: number; // Purchased credits (never reset)
  lastFreeCreditReset: Date;
  lastUpdated: Date;
}

// In-memory storage for testing (replace with actual Firebase later)
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'sayyedasif444@gmail.com',
    freeCredits: 2, // Starting free credits
    purchasedCredits: 0, // No purchased credits initially
    lastFreeCreditReset: new Date(),
    lastUpdated: new Date()
  }
];

export const findUserByEmail = async (email: string): Promise<any> => {
  console.log('Mock: Finding user by email:', email);
  
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.log('Mock: User not found');
    return null;
  }
  
  // Check if 24 hours have passed since last free credit reset
  const now = new Date();
  const hoursSinceReset = (now.getTime() - user.lastFreeCreditReset.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceReset >= 24) {
    console.log('Mock: 24 hours passed, resetting free credits');
    user.freeCredits = 2; // Reset to 2 free credits
    user.lastFreeCreditReset = now;
  }
  
  console.log('Mock: User found - Free credits:', user.freeCredits, 'Purchased credits:', user.purchasedCredits);
  
  return {
    id: user.id,
    data: () => ({
      email: user.email,
      freeCredits: user.freeCredits,
      purchasedCredits: user.purchasedCredits,
      totalCredits: user.freeCredits + user.purchasedCredits,
      lastFreeCreditReset: user.lastFreeCreditReset,
      lastUpdated: user.lastUpdated
    }),
    ref: {
      update: async (updates: any) => {
        console.log('Mock: Updating user with:', updates);
        const userIndex = mockUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
          console.log('Mock: User updated successfully');
        }
      }
    }
  };
};

export const updateUserCredits = async (userDoc: any, creditsToAdd: number, creditType: 'free' | 'purchased' = 'purchased') => {
  console.log(`Mock: Adding ${creditsToAdd} ${creditType} credits`);
  
  const userIndex = mockUsers.findIndex(u => u.id === userDoc.id);
  if (userIndex !== -1) {
    if (creditType === 'purchased') {
      mockUsers[userIndex].purchasedCredits += creditsToAdd;
    } else {
      mockUsers[userIndex].freeCredits += creditsToAdd;
    }
    mockUsers[userIndex].lastUpdated = new Date();
    console.log('Mock: Credits updated successfully');
  }
};

// Helper function to get current user credits (for debugging)
export const getCurrentUserCredits = (email: string): { free: number; purchased: number; total: number } => {
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { free: 0, purchased: 0, total: 0 };
  
  return {
    free: user.freeCredits,
    purchased: user.purchasedCredits,
    total: user.freeCredits + user.purchasedCredits
  };
};

// Helper function to consume credits (prioritizes free credits first)
export const consumeCredits = async (userDoc: any, creditsToUse: number = 1): Promise<boolean> => {
  const userData = userDoc.data();
  const userIndex = mockUsers.findIndex(u => u.id === userDoc.id);
  
  if (userIndex === -1) return false;
  
  const user = mockUsers[userIndex];
  const totalCredits = user.freeCredits + user.purchasedCredits;
  
  if (totalCredits < creditsToUse) {
    console.log('Mock: Insufficient credits');
    return false;
  }
  
  // Use free credits first, then purchased credits
  if (user.freeCredits >= creditsToUse) {
    user.freeCredits -= creditsToUse;
    console.log(`Mock: Used ${creditsToUse} free credits. Remaining free: ${user.freeCredits}`);
  } else {
    const remainingFromFree = user.freeCredits;
    const neededFromPurchased = creditsToUse - remainingFromFree;
    
    user.freeCredits = 0;
    user.purchasedCredits -= neededFromPurchased;
    
    console.log(`Mock: Used ${remainingFromFree} free credits and ${neededFromPurchased} purchased credits`);
  }
  
  user.lastUpdated = new Date();
  return true;
}; 