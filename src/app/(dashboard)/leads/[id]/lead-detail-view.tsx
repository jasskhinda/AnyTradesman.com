'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Send,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  User,
  Users,
  Lock,
} from 'lucide-react';
import type { Profile } from '@/types/database';

interface LeadDetail {
  id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  zip_code: string;
  preferred_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  category_name: string | null;
}

interface ExistingQuote {
  id: string;
  amount: number;
  description: string | null;
  estimated_duration: string | null;
  status: string;
  created_at: string;
}

interface LeadDetailViewProps {
  userProfile: Profile | null;
  lead: LeadDetail;
  existingQuote: ExistingQuote | null;
  customerContact: { full_name: string | null; email: string; phone: string | null } | null;
  hasActiveSubscription: boolean;
  quoteCount: number;
}

function formatTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export function LeadDetailView({
  userProfile,
  lead,
  existingQuote,
  customerContact,
  hasActiveSubscription,
  quoteCount,
}: LeadDetailViewProps) {
  const isOpen = lead.status === 'open';
  const canQuote = isOpen && !existingQuote && hasActiveSubscription;

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header initialUser={userProfile} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/leads" className="inline-flex items-center text-neutral-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{lead.title}</h1>
            <p className="text-neutral-400 mt-1">
              {lead.category_name && <>{lead.category_name} &bull; </>}
              Posted {formatTimeAgo(lead.created_at)}
            </p>
          </div>
          {canQuote && (
            <Link href={`/leads/${lead.id}/quote`}>
              <Button size="lg">
                <Send className="w-4 h-4 mr-2" />
                Send Quote
              </Button>
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-200 whitespace-pre-wrap">{lead.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Location &amp; Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-400">Service Location</p>
                      <p className="text-neutral-200">
                        {lead.city}, {lead.state} {lead.zip_code}
                      </p>
                      {!existingQuote && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Full address shared after you quote
                        </p>
                      )}
                    </div>
                  </div>

                  {lead.preferred_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-neutral-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-400">Preferred Date</p>
                        <p className="text-neutral-200">
                          {new Date(lead.preferred_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {(lead.budget_min || lead.budget_max) && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-neutral-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-400">Customer Budget</p>
                        <p className="text-neutral-200">
                          {lead.budget_min && lead.budget_max
                            ? `$${lead.budget_min} - $${lead.budget_max}`
                            : lead.budget_min
                            ? `From $${lead.budget_min}`
                            : `Up to $${lead.budget_max}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-neutral-400">Competition</p>
                      <p className="text-neutral-200">
                        {quoteCount === 0
                          ? 'No quotes yet — be the first'
                          : `${quoteCount} ${quoteCount === 1 ? 'quote' : 'quotes'} sent`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {existingQuote && (
              <Card className="border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-red-400" />
                    Your Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">Amount</p>
                      <p className="text-2xl font-bold text-white">${existingQuote.amount}</p>
                    </div>
                    {existingQuote.estimated_duration && (
                      <div>
                        <p className="text-sm text-neutral-400">Estimated Duration</p>
                        <p className="text-neutral-200">{existingQuote.estimated_duration}</p>
                      </div>
                    )}
                  </div>
                  {existingQuote.description && (
                    <div>
                      <p className="text-sm text-neutral-400 mb-1">Your Message</p>
                      <p className="text-neutral-200">{existingQuote.description}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Clock className="w-4 h-4" />
                      Sent {formatTimeAgo(existingQuote.created_at)}
                    </span>
                    {existingQuote.status === 'accepted' && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                        Accepted by customer
                      </span>
                    )}
                    {existingQuote.status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-500/20 text-neutral-300">
                        Declined
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {existingQuote ? (
                  <Button variant="outline" disabled className="w-full border-neutral-700 text-neutral-500">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Quote Sent
                  </Button>
                ) : !isOpen ? (
                  <Button variant="outline" disabled className="w-full border-neutral-700 text-neutral-500">
                    Closed to new quotes
                  </Button>
                ) : hasActiveSubscription ? (
                  <Link href={`/leads/${lead.id}/quote`}>
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Quote
                    </Button>
                  </Link>
                ) : (
                  <Link href="/business/subscription">
                    <Button className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      Subscribe to Quote
                    </Button>
                  </Link>
                )}
                <Link href="/leads">
                  <Button variant="outline" className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                    Back to All Leads
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {existingQuote && customerContact ? (
              <Card className="border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-green-400" />
                    Customer Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Name</p>
                    <p className="text-neutral-200 font-medium">
                      {customerContact.full_name || 'Not provided'}
                    </p>
                  </div>
                  {customerContact.phone && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Phone</p>
                      <a
                        href={`tel:${customerContact.phone}`}
                        className="text-green-400 hover:text-green-300 flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {customerContact.phone}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Email</p>
                    <a
                      href={`mailto:${customerContact.email}`}
                      className="text-green-400 hover:text-green-300 flex items-center gap-2 break-all"
                    >
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      {customerContact.email}
                    </a>
                  </div>
                  <div className="pt-3 border-t border-neutral-800">
                    <p className="text-xs text-neutral-500">
                      Contact the customer directly to discuss the project and finalize details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Lock className="w-5 h-5 text-neutral-500" />
                    Customer Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-400">
                    The customer&apos;s name, phone, and email unlock as soon as you send a
                    quote on this job.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-white text-base">Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-400 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Respond quickly to stand out</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Be detailed in your message</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Provide fair, competitive pricing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Highlight your experience</span>
                </div>
              </CardContent>
            </Card>

            {!isOpen && (
              <Card className="border-yellow-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-400">Lead No Longer Open</p>
                      <p className="text-sm text-neutral-400 mt-1">
                        This service request is no longer accepting new quotes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
