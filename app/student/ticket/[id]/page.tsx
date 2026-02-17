'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StudentHeader } from '@/components/student-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { name: string };
  createdAt: string;
  assignment?: {
    worker: { name: string; email: string };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user session
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }

        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Get ticket
        const ticketRes = await fetch(`/api/tickets/${ticketId}`);
        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          setTicket(ticketData.ticket);
        } else {
          setError('Ticket not found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, ticketId]);

  const handleSendOTP = async () => {
    setError(null);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      setShowOTPForm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      if (!otp) {
        setError('Please enter the OTP');
        setVerifying(false);
        return;
      }

      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, ticketId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      // Refresh ticket
      const ticketRes = await fetch(`/api/tickets/${ticketId}`);
      if (ticketRes.ok) {
        const ticketData = await ticketRes.json();
        setTicket(ticketData.ticket);
      }

      setOtp('');
      setShowOTPForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <StudentHeader userName="Loading..." />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <StudentHeader userName={user?.name || 'Student'} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12 text-white">
            {error ? error : 'Ticket not found'}
          </div>
        </main>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
    DONE: 'bg-green-100 text-green-800',
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-800',
    MEDIUM: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <StudentHeader userName={user?.name || 'Student'} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/student')}>
              ← Back
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">{ticket.title}</CardTitle>
                  <CardDescription>
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={statusColors[ticket.status] || statusColors.PENDING}>
                    {ticket.status}
                  </Badge>
                  <Badge className={priorityColors[ticket.priority] || priorityColors.MEDIUM}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Category</h3>
                  <p className="text-slate-700">{ticket.category.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Status</h3>
                  <p className="text-slate-700 capitalize">{ticket.status.toLowerCase()}</p>
                </div>
              </div>

              {ticket.assignment && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Assigned To</h3>
                  <p className="text-blue-800">{ticket.assignment.worker.name}</p>
                  <p className="text-sm text-blue-700">{ticket.assignment.worker.email}</p>
                </div>
              )}

              {ticket.status === 'COMPLETED' && !showOTPForm && (
                <Button
                  onClick={handleSendOTP}
                  className="w-full"
                  size="lg"
                >
                  Verify Completion
                </Button>
              )}

              {ticket.status === 'COMPLETED' && showOTPForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Verification Code</CardTitle>
                    <CardDescription>
                      We've sent a code to {user?.email}. Enter it below to confirm completion.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="otp" className="text-sm font-medium">
                          Verification Code
                        </label>
                        <Input
                          id="otp"
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          disabled={verifying}
                          maxLength={6}
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={verifying}
                          className="flex-1"
                        >
                          {verifying ? 'Verifying...' : 'Verify'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowOTPForm(false);
                            setOtp('');
                          }}
                          disabled={verifying}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {ticket.status === 'DONE' && (
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-green-800 font-semibold">
                    ✓ Ticket verified and completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
