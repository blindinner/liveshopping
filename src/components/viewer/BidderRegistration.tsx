'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface BidderRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, email: string, phone?: string) => Promise<boolean>;
  locale: 'he' | 'en';
}

export function BidderRegistration({
  isOpen,
  onClose,
  onRegister,
  locale,
}: BidderRegistrationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRTL = locale === 'he';

  const t = {
    he: {
      title: 'הרשמה להצעות',
      subtitle: 'הזן את פרטיך כדי להשתתף במכירה הפומבית',
      name: 'שם מלא',
      namePlaceholder: 'ישראל ישראלי',
      email: 'אימייל',
      emailPlaceholder: 'your@email.com',
      phone: 'טלפון (אופציונלי)',
      phonePlaceholder: '050-1234567',
      register: 'הירשם להצעות',
      cancel: 'ביטול',
      required: 'שדה חובה',
      invalidEmail: 'כתובת אימייל לא תקינה',
    },
    en: {
      title: 'Register to Bid',
      subtitle: 'Enter your details to participate in the auction',
      name: 'Full Name',
      namePlaceholder: 'John Doe',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      phone: 'Phone (optional)',
      phonePlaceholder: '050-1234567',
      register: 'Register to Bid',
      cancel: 'Cancel',
      required: 'Required field',
      invalidEmail: 'Invalid email address',
    },
  }[locale];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.required);
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onRegister(name.trim(), email.trim(), phone.trim() || undefined);
      if (success) {
        onClose();
        setName('');
        setEmail('');
        setPhone('');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/20 w-full max-w-sm overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-orange-500/20 border-b border-white/10 px-4 py-3">
          <h2 className="text-white font-semibold text-lg">{t.title}</h2>
          <p className="text-white/60 text-sm">{t.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">{t.name} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full bg-black/30 text-white rounded-lg px-3 py-2.5 border border-white/10 focus:outline-none focus:border-orange-500 placeholder:text-white/30"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">{t.email} *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full bg-black/30 text-white rounded-lg px-3 py-2.5 border border-white/10 focus:outline-none focus:border-orange-500 placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">{t.phone}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.phonePlaceholder}
              className="w-full bg-black/30 text-white rounded-lg px-3 py-2.5 border border-white/10 focus:outline-none focus:border-orange-500 placeholder:text-white/30"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-white/70 hover:text-white transition-colors"
            >
              {t.cancel}
            </button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {t.register}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
