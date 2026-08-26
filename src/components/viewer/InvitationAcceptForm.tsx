'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { GuestProfile } from '@/types/database';

interface InvitationAcceptFormProps {
  email: string;
  existingProfile?: GuestProfile | null;
  onAccept: (data: FormData) => Promise<void>;
  onDecline: () => Promise<void>;
  isSubmitting?: boolean;
}

interface FormData {
  name: string;
  phone: string;
  company_name: string;
  vat_number: string;
  is_business: boolean;
  billing_address: string;
  billing_city: string;
  billing_postal_code: string;
  billing_country: string;
}

export function InvitationAcceptForm({
  email,
  existingProfile,
  onAccept,
  onDecline,
  isSubmitting = false,
}: InvitationAcceptFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: existingProfile?.name || '',
    phone: existingProfile?.phone || '',
    company_name: existingProfile?.company_name || '',
    vat_number: existingProfile?.vat_number || '',
    is_business: existingProfile?.is_business || false,
    billing_address: existingProfile?.billing_address || '',
    billing_city: existingProfile?.billing_city || '',
    billing_postal_code: existingProfile?.billing_postal_code || '',
    billing_country: existingProfile?.billing_country || '',
  });

  const [isDeclined, setIsDeclined] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAccept(formData);
  };

  const handleDecline = async () => {
    setIsDeclined(true);
    try {
      await onDecline();
    } catch {
      setIsDeclined(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
        <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60">
          {email}
        </div>
      </div>

      {/* Name */}
      <Input
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Your full name"
      />

      {/* Phone */}
      <Input
        name="phone"
        label="Phone Number"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+1 234 567 8900"
      />

      {/* Business toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_business"
          name="is_business"
          checked={formData.is_business}
          onChange={handleChange}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-pink-500 focus:ring-pink-500"
        />
        <label htmlFor="is_business" className="text-sm text-white/80">
          I am purchasing as a business
        </label>
      </div>

      {/* Business fields */}
      {formData.is_business && (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <Input
            name="company_name"
            label="Company Name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Your company name"
          />
          <Input
            name="vat_number"
            label="VAT Number"
            value={formData.vat_number}
            onChange={handleChange}
            placeholder="e.g., EU123456789"
          />
        </div>
      )}

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white/80">Billing Address</h3>
        <Input
          name="billing_address"
          label="Street Address"
          value={formData.billing_address}
          onChange={handleChange}
          placeholder="123 Main Street"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="billing_city"
            label="City"
            value={formData.billing_city}
            onChange={handleChange}
            placeholder="City"
          />
          <Input
            name="billing_postal_code"
            label="Postal Code"
            value={formData.billing_postal_code}
            onChange={handleChange}
            placeholder="12345"
          />
        </div>
        <Input
          name="billing_country"
          label="Country"
          value={formData.billing_country}
          onChange={handleChange}
          placeholder="Country"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          isLoading={isSubmitting && !isDeclined}
          disabled={!formData.name || isSubmitting}
          className="flex-1"
        >
          Accept Invitation
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleDecline}
          isLoading={isDeclined && isSubmitting}
          disabled={isSubmitting}
        >
          Decline
        </Button>
      </div>
    </form>
  );
}
