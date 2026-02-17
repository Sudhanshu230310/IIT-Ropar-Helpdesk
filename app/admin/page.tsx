'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { name: string };
  createdAt: string;
  student: { name: string; email: string };
  assignment?: { worker: { name: string } };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

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
        if (sessionData.user.role !== 'ADMIN') {
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

        // Get workers
        const workersRes = await fetch('/api/admin/workers');
        if (workersRes.ok) {
          const workersData = await workersRes.json();
          setWorkers(workersData.workers || []);
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

  const handleAssignTicket = async (ticketId: string, workerId: string) => {
    if (!workerId) {
      setError('Please select a worker');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, workerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign ticket');
      }

      // Refresh tickets
      const ticketsRes = await fetch('/api/tickets');
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets || []);
      }

      setSelectedTicket(null);
      setSelectedWorker('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <AdminHeader userName="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const pendingTickets = tickets.filter((t) => t.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <AdminHeader userName={user?.name || 'Admin'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 mt-2">
                {pendingTickets.length} pending ticket{pendingTickets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link href="/admin/workers">
              <Button>Manage Workers</Button>
            </Link>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {pendingTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No pending tickets
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTickets.map((ticket) => (
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
                      <Badge>PENDING</Badge>
                    </div>

                    {selectedTicket === ticket.id ? (
                      <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                        <label className="text-sm font-medium">
                          Assign to Worker:
                        </label>
                        <select
                          value={selectedWorker}
                          onChange={(e) => setSelectedWorker(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          disabled={assigning}
                        >
                          <option value="">Select a worker</option>
                          {workers.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                              {worker.name} ({worker.email})
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleAssignTicket(ticket.id, selectedWorker)
                            }
                            disabled={assigning}
                            className="flex-1"
                          >
                            {assigning ? 'Assigning...' : 'Assign'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedTicket(null);
                              setSelectedWorker('');
                            }}
                            disabled={assigning}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedTicket(ticket.id)}
                        className="w-full"
                      >
                        Assign Ticket
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
