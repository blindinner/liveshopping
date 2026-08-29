'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import type { Show, Product, Bidder, GuestProfile } from '@/types/database';

type ResultsTab = 'winners' | 'attendees';

interface AttendeeStats {
  id: string;
  viewer_id: string;
  name: string;
  email: string;
  phone: string | null;
  joined_at: string;
  bid_count: number;
  chat_count: number;
  total_bid_amount: number;
  highest_bid: number;
  won_count: number;
  won_total: number;
  invitation_id: string | null;
  guest_profile?: {
    company_name: string | null;
    is_business: boolean;
  } | null;
}

interface AttendeesSummary {
  total_attendees: number;
  total_bids: number;
  total_chat_messages: number;
  total_winners: number;
  active_bidders: number;
  active_chatters: number;
}

type WinnerPaymentStatus = 'needs_invoice' | 'invoice_sent' | 'paid';

interface AuctionWinner {
  id: string;
  show_product_id: string;
  bidder_id: string;
  winning_amount: number;
  payment_status: WinnerPaymentStatus;
  status_updated_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  bidder: Bidder;
  show_product: {
    id: string;
    product: Product;
  };
}

interface WinnerWithProfile extends AuctionWinner {
  guest_profile?: GuestProfile | null;
}

const STATUS_CONFIG: Record<WinnerPaymentStatus, { label: string; color: string; bgColor: string; nextStatus: WinnerPaymentStatus | null; nextLabel: string }> = {
  needs_invoice: {
    label: 'Needs Invoice',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    nextStatus: 'invoice_sent',
    nextLabel: 'Mark Sent',
  },
  invoice_sent: {
    label: 'Invoice Sent',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    nextStatus: 'paid',
    nextLabel: 'Mark Paid',
  },
  paid: {
    label: 'Paid',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    nextStatus: null,
    nextLabel: '',
  },
};

export default function ShowResultsPage() {
  const params = useParams();
  const showId = params.showId as string;

  const [show, setShow] = useState<Show | null>(null);
  const [winners, setWinners] = useState<WinnerWithProfile[]>([]);
  const [attendees, setAttendees] = useState<AttendeeStats[]>([]);
  const [attendeesSummary, setAttendeesSummary] = useState<AttendeesSummary | null>(null);
  const [activeTab, setActiveTab] = useState<ResultsTab>('winners');
  const [statusFilter, setStatusFilter] = useState<WinnerPaymentStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [bidHistory, setBidHistory] = useState<Record<string, Array<{
    id: string;
    amount: number;
    created_at: string;
    bidder: { name: string; email: string; phone: string | null };
  }>>>({});
  const [loadingBidHistory, setLoadingBidHistory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [showId]);

  // Load attendees when tab switches
  useEffect(() => {
    if (activeTab === 'attendees' && attendees.length === 0 && !isLoading) {
      loadAttendees();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [showResponse, winnersResponse] = await Promise.all([
        fetch(`/api/shows/${showId}`),
        fetch(`/api/shows/${showId}/winners`),
      ]);

      const showData = await showResponse.json();
      const winnersData = await winnersResponse.json();

      setShow(showData.show);

      // For private shows, fetch guest profiles for each winner
      if (showData.show?.auction_type === 'private' && winnersData.winners?.length > 0) {
        const winnersWithProfiles = await Promise.all(
          winnersData.winners.map(async (winner: AuctionWinner) => {
            if (winner.bidder.invitation_id) {
              try {
                const invResponse = await fetch(`/api/invitations/${winner.bidder.invitation_id}/profile`);
                if (invResponse.ok) {
                  const profileData = await invResponse.json();
                  return { ...winner, guest_profile: profileData.guest_profile };
                }
              } catch (e) {
                console.error('Failed to fetch guest profile:', e);
              }
            }
            return winner;
          })
        );
        setWinners(winnersWithProfiles);
      } else {
        setWinners(winnersData.winners || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendees = async () => {
    try {
      const response = await fetch(`/api/shows/${showId}/attendees`);
      const data = await response.json();
      setAttendees(data.attendees || []);
      setAttendeesSummary(data.summary || null);
    } catch (error) {
      console.error('Failed to load attendees:', error);
    }
  };

  const exportAttendeesToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Joined At',
      'Bids Placed',
      'Chat Messages',
      'Total Bid Amount',
      'Highest Bid',
      'Items Won',
      'Won Total',
      'Company',
    ];

    const rows = attendees.map(a => [
      a.name,
      a.email,
      a.phone || '',
      a.joined_at,
      a.bid_count,
      a.chat_count,
      a.total_bid_amount,
      a.highest_bid,
      a.won_count,
      a.won_total,
      a.guest_profile?.company_name || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${show?.title || 'show'}-attendees-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateWinnerStatus = async (winnerId: string, newStatus: WinnerPaymentStatus) => {
    try {
      const response = await fetch(`/api/shows/${showId}/winners/${winnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      if (response.ok) {
        const now = new Date().toISOString();
        setWinners(prev =>
          prev.map(w =>
            w.id === winnerId
              ? {
                  ...w,
                  payment_status: newStatus,
                  status_updated_at: now,
                  paid_at: newStatus === 'paid' ? now : w.paid_at,
                }
              : w
          )
        );
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const advanceStatus = (winner: WinnerWithProfile) => {
    const config = STATUS_CONFIG[winner.payment_status];
    if (config.nextStatus) {
      updateWinnerStatus(winner.id, config.nextStatus);
    }
  };

  const revertStatus = (winner: WinnerWithProfile) => {
    const statusOrder: WinnerPaymentStatus[] = ['needs_invoice', 'invoice_sent', 'paid'];
    const currentIndex = statusOrder.indexOf(winner.payment_status);
    if (currentIndex > 0) {
      updateWinnerStatus(winner.id, statusOrder[currentIndex - 1]);
    }
  };

  const startEditingNotes = (winner: WinnerWithProfile) => {
    setEditingNotesId(winner.id);
    setNotesInput(winner.notes || '');
  };

  const saveNotes = async (winnerId: string) => {
    try {
      const response = await fetch(`/api/shows/${showId}/winners/${winnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesInput || null }),
      });

      if (response.ok) {
        setWinners(prev =>
          prev.map(w =>
            w.id === winnerId ? { ...w, notes: notesInput || null } : w
          )
        );
        setEditingNotesId(null);
        setNotesInput('');
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const cancelEditingNotes = () => {
    setEditingNotesId(null);
    setNotesInput('');
  };

  const loadBidHistory = async (showProductId: string) => {
    if (bidHistory[showProductId]) return; // Already loaded

    setLoadingBidHistory(showProductId);
    try {
      const response = await fetch(`/api/shows/${showId}/products/${showProductId}/bids`);
      const data = await response.json();
      setBidHistory(prev => ({ ...prev, [showProductId]: data.bids || [] }));
    } catch (error) {
      console.error('Failed to load bid history:', error);
    } finally {
      setLoadingBidHistory(null);
    }
  };

  const handleExpandToggle = async (winnerId: string, showProductId: string) => {
    if (expandedId === winnerId) {
      setExpandedId(null);
    } else {
      setExpandedId(winnerId);
      await loadBidHistory(showProductId);
    }
  };

  const copyInvoiceInfo = (winner: WinnerWithProfile) => {
    const profile = winner.guest_profile;
    const lines = [
      `=== INVOICE INFO ===`,
      ``,
      `ITEM`,
      `Product: ${winner.show_product.product.title}`,
      `Amount: ${formatPrice(winner.winning_amount, winner.show_product.product.currency)}`,
      `Date: ${formatDate(winner.created_at)}`,
      ``,
      `CUSTOMER`,
      `Name: ${winner.bidder.name}`,
      `Email: ${winner.bidder.email}`,
      winner.bidder.phone ? `Phone: ${winner.bidder.phone}` : null,
    ].filter(Boolean);

    if (profile) {
      if (profile.is_business) {
        lines.push(``, `BUSINESS INFO`);
        if (profile.company_name) lines.push(`Company: ${profile.company_name}`);
        if (profile.vat_number) lines.push(`VAT/Tax ID: ${profile.vat_number}`);
      }
      if (profile.billing_address || profile.billing_city) {
        lines.push(``, `BILLING ADDRESS`);
        if (profile.billing_address) lines.push(profile.billing_address);
        const cityLine = [profile.billing_city, profile.billing_postal_code].filter(Boolean).join(' ');
        if (cityLine) lines.push(cityLine);
        if (profile.billing_country) lines.push(profile.billing_country);
      }
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId(winner.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    const headers = [
      'Product',
      'Winning Amount',
      'Currency',
      'Winner Name',
      'Email',
      'Phone',
      'Payment Status',
      'Won At',
      'Paid At',
      'Company Name',
      'VAT Number',
      'Billing Address',
      'Billing City',
      'Billing Postal Code',
      'Billing Country',
    ];

    const rows = winners.map(winner => {
      const profile = winner.guest_profile;
      return [
        winner.show_product.product.title,
        winner.winning_amount,
        winner.show_product.product.currency,
        winner.bidder.name,
        winner.bidder.email,
        winner.bidder.phone || '',
        winner.payment_status,
        winner.created_at,
        winner.paid_at || '',
        profile?.company_name || '',
        profile?.vat_number || '',
        profile?.billing_address || '',
        profile?.billing_city || '',
        profile?.billing_postal_code || '',
        profile?.billing_country || '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${show?.title || 'auction'}-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Calculate summary stats
  const totalRevenue = winners.reduce((sum, w) => sum + w.winning_amount, 0);
  const itemsSold = winners.length;
  const uniqueWinners = new Set(winners.map(w => w.bidder.email)).size;
  const statusCounts = {
    needs_invoice: winners.filter(w => w.payment_status === 'needs_invoice').length,
    invoice_sent: winners.filter(w => w.payment_status === 'invoice_sent').length,
    paid: winners.filter(w => w.payment_status === 'paid').length,
  };
  const currency = winners[0]?.show_product.product.currency || 'ILS';

  // Filter winners by status
  const filteredWinners = statusFilter === 'all'
    ? winners
    : winners.filter(w => w.payment_status === statusFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <p className="text-white/60">Show not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/host"
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">{show.title}</h1>
              <p className="text-white/50 text-sm">
                {formatDate(show.scheduled_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {show.auction_type === 'private' && (
              <Badge variant="default">Private</Badge>
            )}
            <Badge variant="ended">Ended</Badge>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-white/50 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400">
                {formatPrice(totalRevenue, currency)}
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-white/50 text-sm">Items Sold</p>
              <p className="text-2xl font-bold text-white">{itemsSold}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-white/50 text-sm">Unique Winners</p>
              <p className="text-2xl font-bold text-white">{uniqueWinners}</p>
            </div>
            {/* Status filter buttons */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'needs_invoice' ? 'all' : 'needs_invoice')}
              className={`rounded-2xl p-4 border transition-colors text-left ${
                statusFilter === 'needs_invoice'
                  ? 'bg-yellow-500/20 border-yellow-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <p className="text-white/50 text-sm">Needs Invoice</p>
              <p className={`text-2xl font-bold ${statusCounts.needs_invoice > 0 ? 'text-yellow-400' : 'text-white/30'}`}>
                {statusCounts.needs_invoice}
              </p>
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'invoice_sent' ? 'all' : 'invoice_sent')}
              className={`rounded-2xl p-4 border transition-colors text-left ${
                statusFilter === 'invoice_sent'
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <p className="text-white/50 text-sm">Invoice Sent</p>
              <p className={`text-2xl font-bold ${statusCounts.invoice_sent > 0 ? 'text-blue-400' : 'text-white/30'}`}>
                {statusCounts.invoice_sent}
              </p>
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
              className={`rounded-2xl p-4 border transition-colors text-left ${
                statusFilter === 'paid'
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <p className="text-white/50 text-sm">Paid</p>
              <p className={`text-2xl font-bold ${statusCounts.paid > 0 ? 'text-green-400' : 'text-white/30'}`}>
                {statusCounts.paid}
              </p>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-white/10">
            <div className="flex">
              <button
                onClick={() => setActiveTab('winners')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === 'winners'
                    ? 'text-white border-orange-500'
                    : 'text-white/50 border-transparent hover:text-white/80'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Winners
                {winners.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded">
                    {winners.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('attendees')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === 'attendees'
                    ? 'text-white border-pink-500'
                    : 'text-white/50 border-transparent hover:text-white/80'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Attendees
                {attendeesSummary && (
                  <span className="px-1.5 py-0.5 text-xs bg-pink-500/20 text-pink-400 rounded">
                    {attendeesSummary.total_attendees}
                  </span>
                )}
              </button>
            </div>

            {/* Export button */}
            {activeTab === 'winners' && winners.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            )}
            {activeTab === 'attendees' && attendees.length > 0 && (
              <button
                onClick={exportAttendeesToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            )}
          </div>

          {/* Winners Tab */}
          {activeTab === 'winners' && (
            <>

          {/* Filter indicator */}
          {statusFilter !== 'all' && (
            <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
              <span className="text-white/70 text-sm">
                Showing {filteredWinners.length} of {winners.length} winners with status: <span className={STATUS_CONFIG[statusFilter].color}>{STATUS_CONFIG[statusFilter].label}</span>
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-white/50 hover:text-white text-sm"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Winners List */}
          {filteredWinners.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
              <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/50">
                {winners.length === 0 ? 'No auction winners yet' : 'No winners match the current filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWinners.map((winner) => (
                <div
                  key={winner.id}
                  className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                >
                  {/* Main row */}
                  <div className="p-4 flex items-center gap-4">
                    {/* Product image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0">
                      {winner.show_product.product.image_url ? (
                        <Image
                          src={winner.show_product.product.image_url}
                          alt={winner.show_product.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product & Price */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {winner.show_product.product.title}
                      </h3>
                      <p className="text-orange-400 font-bold text-lg">
                        {formatPrice(winner.winning_amount, winner.show_product.product.currency)}
                      </p>
                    </div>

                    {/* Winner info */}
                    <div className="hidden md:block text-right">
                      <p className="text-white font-medium">{winner.bidder.name}</p>
                      <p className="text-white/60 text-sm">{winner.bidder.email}</p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      {/* Current status badge */}
                      <div className={`px-3 py-1.5 ${STATUS_CONFIG[winner.payment_status].bgColor} ${STATUS_CONFIG[winner.payment_status].color} text-sm rounded-lg`}>
                        {STATUS_CONFIG[winner.payment_status].label}
                      </div>

                      {/* Advance status button */}
                      {STATUS_CONFIG[winner.payment_status].nextStatus && (
                        <button
                          onClick={() => advanceStatus(winner)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {STATUS_CONFIG[winner.payment_status].nextLabel}
                        </button>
                      )}

                      {/* Revert status button (only if not at first status) */}
                      {winner.payment_status !== 'needs_invoice' && (
                        <button
                          onClick={() => revertStatus(winner)}
                          className="p-2 text-white/40 hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                          title="Revert to previous status"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => copyInvoiceInfo(winner)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy invoice info"
                      >
                        {copiedId === winner.id ? (
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleExpandToggle(winner.id, winner.show_product_id)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {loadingBidHistory === winner.show_product_id ? (
                          <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            className={`w-5 h-5 transition-transform ${expandedId === winner.id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === winner.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/10 mt-0">
                      <div className="pt-4 grid md:grid-cols-3 gap-4">
                        {/* Contact Info */}
                        <div className="bg-black/30 rounded-xl p-4">
                          <h4 className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wide">Contact</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-white">{winner.bidder.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${winner.bidder.email}`} className="text-blue-400 hover:underline">
                                {winner.bidder.email}
                              </a>
                            </div>
                            {winner.bidder.phone && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${winner.bidder.phone}`} className="text-blue-400 hover:underline">
                                  {winner.bidder.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Business Info (for private auctions) */}
                        {winner.guest_profile && (winner.guest_profile.is_business || winner.guest_profile.company_name) && (
                          <div className="bg-black/30 rounded-xl p-4">
                            <h4 className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wide">Business</h4>
                            <div className="space-y-2">
                              {winner.guest_profile.company_name && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span className="text-white">{winner.guest_profile.company_name}</span>
                                </div>
                              )}
                              {winner.guest_profile.vat_number && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-white">{winner.guest_profile.vat_number}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Billing Address */}
                        {winner.guest_profile && (winner.guest_profile.billing_address || winner.guest_profile.billing_city) && (
                          <div className="bg-black/30 rounded-xl p-4">
                            <h4 className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wide">Billing Address</h4>
                            <div className="text-white space-y-1">
                              {winner.guest_profile.billing_address && (
                                <p>{winner.guest_profile.billing_address}</p>
                              )}
                              {(winner.guest_profile.billing_city || winner.guest_profile.billing_postal_code) && (
                                <p>
                                  {[winner.guest_profile.billing_city, winner.guest_profile.billing_postal_code]
                                    .filter(Boolean)
                                    .join(' ')}
                                </p>
                              )}
                              {winner.guest_profile.billing_country && (
                                <p>{winner.guest_profile.billing_country}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Timestamps */}
                        <div className="bg-black/30 rounded-xl p-4">
                          <h4 className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wide">Timeline</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">Won at</span>
                              <span className="text-white">{formatDate(winner.created_at)}</span>
                            </div>
                            {winner.status_updated_at && (
                              <div className="flex items-center justify-between">
                                <span className="text-white/60">Status updated</span>
                                <span className="text-white/70">{formatDate(winner.status_updated_at)}</span>
                              </div>
                            )}
                            {winner.paid_at && (
                              <div className="flex items-center justify-between">
                                <span className="text-white/60">Paid at</span>
                                <span className="text-green-400">{formatDate(winner.paid_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mt-4 bg-black/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white/50 text-xs font-medium uppercase tracking-wide">Notes</h4>
                          {editingNotesId !== winner.id && (
                            <button
                              onClick={() => startEditingNotes(winner)}
                              className="text-white/50 hover:text-white text-xs flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </button>
                          )}
                        </div>
                        {editingNotesId === winner.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={notesInput}
                              onChange={(e) => setNotesInput(e.target.value)}
                              placeholder="Add notes about this order (e.g., invoice sent via email, special delivery instructions...)"
                              className="w-full bg-black/30 text-white placeholder-white/30 text-sm p-3 rounded-lg border border-white/10 focus:outline-none focus:border-white/30 resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEditingNotes}
                                className="px-3 py-1.5 text-white/60 hover:text-white text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveNotes(winner.id)}
                                className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-sm ${winner.notes ? 'text-white' : 'text-white/30 italic'}`}>
                            {winner.notes || 'No notes yet'}
                          </p>
                        )}
                      </div>

                      {/* Bid History */}
                      {bidHistory[winner.show_product_id] && bidHistory[winner.show_product_id].length > 0 && (
                        <div className="mt-4 bg-black/30 rounded-xl p-4">
                          <h4 className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wide">
                            Bid History ({bidHistory[winner.show_product_id].length} bids)
                          </h4>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {bidHistory[winner.show_product_id].map((bid, index) => (
                              <div
                                key={bid.id}
                                className={`flex items-center justify-between p-2 rounded-lg ${
                                  index === 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-black/20'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold ${index === 0 ? 'text-green-400' : 'text-white'}`}>
                                    {formatPrice(bid.amount, winner.show_product.product.currency)}
                                  </span>
                                  {index === 0 && (
                                    <span className="text-green-400 text-xs bg-green-500/20 px-2 py-0.5 rounded">
                                      WINNER
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-white text-sm">{bid.bidder.name}</p>
                                  <p className="text-white/50 text-xs">{bid.bidder.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </>
          )}

          {/* Attendees Tab */}
          {activeTab === 'attendees' && (
            <>
              {/* Attendees Summary */}
              {attendeesSummary && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/50 text-xs">Registered</p>
                    <p className="text-xl font-bold text-white">{attendeesSummary.total_attendees}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/50 text-xs">Active Bidders</p>
                    <p className="text-xl font-bold text-white">{attendeesSummary.active_bidders}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/50 text-xs">Total Bids</p>
                    <p className="text-xl font-bold text-white">{attendeesSummary.total_bids}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/50 text-xs">Chat Messages</p>
                    <p className="text-xl font-bold text-white">{attendeesSummary.total_chat_messages}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/50 text-xs">Active Chatters</p>
                    <p className="text-xl font-bold text-white">{attendeesSummary.active_chatters}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/50 text-xs">Winners</p>
                    <p className="text-xl font-bold text-green-400">{attendeesSummary.total_winners}</p>
                  </div>
                </div>
              )}

              {/* Attendees List */}
              {attendees.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                  <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-white/50">No registered attendees</p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase tracking-wide">Attendee</th>
                          <th className="text-left text-white/50 text-xs font-medium px-4 py-3 uppercase tracking-wide">Contact</th>
                          <th className="text-center text-white/50 text-xs font-medium px-4 py-3 uppercase tracking-wide">Bids</th>
                          <th className="text-center text-white/50 text-xs font-medium px-4 py-3 uppercase tracking-wide">Chat</th>
                          <th className="text-center text-white/50 text-xs font-medium px-4 py-3 uppercase tracking-wide">Won</th>
                          <th className="text-right text-white/50 text-xs font-medium px-4 py-3 uppercase tracking-wide">Highest Bid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendees.map((attendee) => (
                          <tr key={attendee.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-medium text-sm">
                                  {attendee.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{attendee.name}</p>
                                  {attendee.guest_profile?.company_name && (
                                    <p className="text-white/40 text-xs">{attendee.guest_profile.company_name}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <a href={`mailto:${attendee.email}`} className="text-blue-400 text-sm hover:underline block">
                                {attendee.email}
                              </a>
                              {attendee.phone && (
                                <a href={`tel:${attendee.phone}`} className="text-white/50 text-xs hover:text-white/70">
                                  {attendee.phone}
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {attendee.bid_count > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full">
                                  {attendee.bid_count}
                                </span>
                              ) : (
                                <span className="text-white/30">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {attendee.chat_count > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                                  {attendee.chat_count}
                                </span>
                              ) : (
                                <span className="text-white/30">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {attendee.won_count > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                                  {attendee.won_count}
                                </span>
                              ) : (
                                <span className="text-white/30">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {attendee.highest_bid > 0 ? (
                                <span className="text-white font-medium">
                                  {formatPrice(attendee.highest_bid, currency)}
                                </span>
                              ) : (
                                <span className="text-white/30">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
