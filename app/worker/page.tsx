'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkerHeader } from '@/components/worker-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { name: string };
  createdAt: string;
  student: { name: string; email: string };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

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
        if (sessionData.user.role !== 'WORKER') {
          router.push('/');
          return;
        }

        setUser(sessionData.user);

        // Get tickets
        const ticketsRes = await fetch('/api/tickets');
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          setTickets(ticketsData.tickets || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCompleteTicket = async (ticketId: string) => {
    setCompleting(ticketId);
    setError(null);

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete ticket');
      }

      // Refresh tickets
      const ticketsRes = await fetch('/api/tickets');
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <WorkerHeader userName="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const assignedTickets = tickets.filter((t) => t.status === 'ASSIGNED');
  const completedTickets = tickets.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <WorkerHeader userName={user?.name || 'Worker'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white">My Assignments</h1>
            <p className="text-slate-400 mt-2">
              {assignedTickets.length} active, {completedTickets.length} completed
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Active Assignments</h2>
            {assignedTickets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No active assignments
              </div>
            ) : (
              <div className="space-y-4">
                {assignedTickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{ticket.title}</CardTitle>
                          <CardDescription>
                            From: {ticket.student.name} ({ticket.student.email})
                          </CardDescription>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {ticket.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600">{ticket.description}</p>

                      <div className="flex gap-2">
                        <Badge variant="secondary">{ticket.category.name}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">ASSIGNED</Badge>
                      </div>

                      <Button
                        onClick={() => handleCompleteTicket(ticket.id)}
                        disabled={completing === ticket.id}
                        className="w-full"
                      >
                        {completing === ticket.id
                          ? 'Completing...'
                          : 'Mark as Completed'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {completedTickets.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Completed Tasks</h2>
              <div className="space-y-4">
                {completedTickets.map((ticket) => (
                  <Card key={ticket.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>{ticket.title}</CardTitle>
                          <CardDescription>
                            From: {ticket.student.name}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          COMPLETED
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
