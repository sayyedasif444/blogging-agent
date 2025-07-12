import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Credit management utilities
export interface CreditData {
  freeCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  lastUpdated: number;
}

export const updateCreditsInLocalStorage = (creditData: CreditData) => {
  try {
    localStorage.setItem('user_credits', JSON.stringify(creditData));
    
    // Notify other components that credits have been updated
    localStorage.setItem('credits_updated', Date.now().toString());
    
    // Dispatch custom event for same-tab updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('creditsUpdated'));
    }
  } catch (error) {
    console.error('Error updating credits in localStorage:', error);
  }
};

export const getCreditsFromLocalStorage = (): CreditData | null => {
  try {
    const storedCredits = localStorage.getItem('user_credits');
    if (storedCredits) {
      return JSON.parse(storedCredits);
    }
  } catch (error) {
    console.error('Error reading credits from localStorage:', error);
  }
  return null;
};

export const clearCreditsFromLocalStorage = () => {
  try {
    localStorage.removeItem('user_credits');
    localStorage.removeItem('credits_updated');
  } catch (error) {
    console.error('Error clearing credits from localStorage:', error);
  }
};
