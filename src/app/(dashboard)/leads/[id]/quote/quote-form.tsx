'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Send, Clock, AlertCircle } from 'lucide-react';

interface QuoteFormProps {
  leadId: string;
}

export function QuoteForm({ leadId }: QuoteFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    estimated_duration: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid quote amount');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/quote/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_request_id: leadId,
          amount,
          message: formData.message || null,
          estimated_duration: formData.estimated_duration || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to submit quote.');
        setSubmitting(false);
        return;
      }

      router.push(`/leads/${leadId}?quoted=true`);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Send Your Quote</CardTitle>
        <CardDescription>Provide your best price and details to win this job</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Quote Amount *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 pl-10 pr-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Enter your total price for completing this job
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Estimated Duration (optional)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                placeholder="e.g., 2-3 hours, 1 day, 1 week"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Message to Customer (optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Introduce yourself and explain why you're the best fit for this job. Include:
• Your relevant experience
• What's included in your quote
• Your availability
• Any questions you have"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
            <Link href={`/leads/${leadId}`} className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Quote
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
