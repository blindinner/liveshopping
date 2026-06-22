'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LeadCaptureFormProps {
  showId: string;
  onComplete: (name: string) => void;
  locale: 'he' | 'en';
  mode?: 'inline' | 'modal';
}

export function LeadCaptureForm({
  showId,
  onComplete,
  locale,
  mode = 'modal',
}: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRTL = locale === 'he';

  const t = {
    he: {
      title: 'הצטרף לשידור',
      name: 'שם',
      phone: 'טלפון',
      email: 'אימייל',
      consent: 'אני מסכים לקבל עדכונים על שידורים חדשים',
      submit: 'הצטרף',
      required: 'שדה חובה',
      namePlaceholder: 'השם שיוצג בצ׳אט',
      phonePlaceholder: '050-0000000',
      emailPlaceholder: 'your@email.com',
    },
    en: {
      title: 'Join the Show',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      consent: 'I agree to receive updates about new shows',
      submit: 'Join',
      required: 'Required',
      namePlaceholder: 'Name shown in chat',
      phonePlaceholder: '050-0000000',
      emailPlaceholder: 'your@email.com',
    },
  }[locale];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.required);
      return;
    }

    if (!consent) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId,
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          consent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      onComplete(name.trim());
    } catch {
      setError(t.required);
    } finally {
      setIsLoading(false);
    }
  };

  const containerClasses =
    mode === 'modal'
      ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
      : '';

  const formClasses =
    mode === 'modal'
      ? 'w-full max-w-sm bg-gray-900/95 backdrop-blur-lg rounded-2xl p-6 border border-white/10'
      : 'bg-black/40 backdrop-blur-md rounded-2xl p-4';

  return (
    <div className={containerClasses} dir={isRTL ? 'rtl' : 'ltr'}>
      <form onSubmit={handleSubmit} className={formClasses}>
        {mode === 'modal' && (
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {t.title}
          </h2>
        )}

        <div className="space-y-4">
          <Input
            name="name"
            label={t.name}
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={error || undefined}
          />

          <Input
            name="phone"
            label={t.phone}
            placeholder={t.phonePlaceholder}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
          />

          <Input
            name="email"
            label={t.email}
            placeholder={t.emailPlaceholder}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-pink-500 focus:ring-pink-500 focus:ring-offset-0"
            />
            <span className="text-sm text-white/80">{t.consent}</span>
          </label>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!consent || !name.trim()}
          className="w-full mt-6"
          size="lg"
        >
          {t.submit}
        </Button>
      </form>
    </div>
  );
}
