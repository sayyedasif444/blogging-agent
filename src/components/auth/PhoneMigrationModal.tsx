'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, AlertCircle } from 'lucide-react';

interface PhoneMigrationModalProps {
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onPhoneAdded: (phone: string) => void;
}

export default function PhoneMigrationModal({ 
  userEmail, 
  isOpen, 
  onClose, 
  onPhoneAdded 
}: PhoneMigrationModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasPhone, setHasPhone] = useState(false);

  useEffect(() => {
    if (isOpen && userEmail) {
      checkUserPhone();
    }
  }, [isOpen, userEmail]);

  const checkUserPhone = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.userData.phone) {
          setHasPhone(true);
          setPhone(data.userData.phone);
        }
      }
    } catch (error) {
      console.error('Error checking user phone:', error);
    } finally {
      setLoading(false);
    }
  };

  // Phone number validation function
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^(\+?[\d\s\-\(\)]{10,})$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return false;
    }
    
    const digitsOnly = cleanPhone.replace(/\+/g, '');
    return digitsOnly.length >= 10;
  };

  const handleSave = async () => {
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (e.g., +91 98765 43210 or 9876543210)');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/migrate-user-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          phone: phone.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onPhoneAdded(phone.trim());
        onClose();
      } else {
        setError(data.error || 'Failed to save phone number');
      }
    } catch (error) {
      console.error('Error saving phone number:', error);
      setError('Failed to save phone number');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking phone number...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user already has phone number, show info
  if (hasPhone) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Phone Number Found</h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Your phone number is already set up: <span className="text-blue-400 font-medium">{phone}</span>
          </p>
          
          <p className="text-sm text-gray-400 mb-6">
            This will be automatically used for Razorpay payments to avoid asking for it during checkout.
          </p>
          
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Phone Number Required</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          We need your phone number to provide a seamless payment experience with Razorpay.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-white font-medium">
              Phone Number <span className="text-red-400">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError('');
              }}
              placeholder="+91 98765 43210 or 9876543210"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 mt-1"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This will be pre-filled during Razorpay payments
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Phone Number'
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 