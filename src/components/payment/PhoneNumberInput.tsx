'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, Check } from 'lucide-react';

interface PhoneNumberInputProps {
  userEmail: string;
  onPhoneUpdated?: (phone: string) => void;
}

export default function PhoneNumberInput({ userEmail, onPhoneUpdated }: PhoneNumberInputProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    // Load existing phone number
    const loadPhoneNumber = async () => {
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
            setPhone(data.userData.phone);
          }
        }
      } catch (error) {
        console.error('Error loading phone number:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      loadPhoneNumber();
    }
  }, [userEmail]);

  const handleSave = async () => {
    if (!phone.trim()) {
      setMessage('Please enter a phone number');
      setMessageType('error');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      setMessage('Please enter a valid phone number');
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/update-user-phone', {
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
        setMessage('Phone number saved successfully! This will be used for Razorpay payments.');
        setMessageType('success');
        onPhoneUpdated?.(phone.trim());
      } else {
        setMessage(data.error || 'Failed to save phone number');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving phone number:', error);
      setMessage('Failed to save phone number');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Loading phone number...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-blue-400" />
        <Label htmlFor="phone" className="text-white font-medium">
          Phone Number for Payments
        </Label>
        <span className="text-red-400 text-sm">*</span>
      </div>
      
      <div className="space-y-2">
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          required
        />
        <p className="text-xs text-gray-400">
          This phone number is required and will be pre-filled in Razorpay to avoid asking for it during payment.
        </p>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Save Phone Number
          </>
        )}
      </Button>

      {message && (
        <div className={`p-3 rounded-md text-sm ${
          messageType === 'success' 
            ? 'bg-green-900/50 border border-green-700 text-green-300' 
            : 'bg-red-900/50 border border-red-700 text-red-300'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 