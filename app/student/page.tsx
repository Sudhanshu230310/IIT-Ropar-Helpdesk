'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentHeader } from '@/components/student-header';
import { TicketCard } from '@/components/ticket-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { name: string };
  createdAt: string;
  assignment?: {
    worker: { name: string };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Get tickets
        const ticketsRes = await fetch('/api/tickets');
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          console.log('Fetched tickets:', ticketsData);
          setTickets(ticketsData.tickets || []);
        } else {
          setError('Failed to load tickets');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <StudentHeader userName="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <StudentHeader userName={user?.name || 'Student'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">My Tickets</h1>
              <p className="text-slate-400 mt-2">
                You have {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link href="/student/new-ticket">
              <Button size="lg">Raise New Ticket</Button>
            </Link>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-4">No tickets yet</p>
              <Link href="/student/new-ticket">
                <Button>Create Your First Ticket</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  {...ticket}
                  assignedTo={ticket.assignment?.worker}
                  isStudent={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
