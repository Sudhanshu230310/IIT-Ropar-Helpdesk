'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">IIT Ropar</h1>
            <p className="text-sm text-slate-400">Problem Ticket System</p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-sm text-slate-400 capitalize">{user.role}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Welcome, {user.name}!
              </h2>
              <p className="text-xl text-slate-400">
                {user.role === 'STUDENT' &&
                  'Manage your problem tickets and track their progress'}
                {user.role === 'ADMIN' &&
                  'Manage workers and assign tickets efficiently'}
                {user.role === 'WORKER' &&
                  'View and complete your assigned work'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user.role === 'STUDENT' && (
                <>
                  <Link href="/student">
                    <Button className="w-full h-24 text-lg">
                      My Tickets
                    </Button>
                  </Link>
                  <Link href="/student/new-ticket">
                    <Button variant="outline" className="w-full h-24 text-lg">
                      Raise New Ticket
                    </Button>
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link href="/admin">
                    <Button className="w-full h-24 text-lg">
                      Pending Tickets
                    </Button>
                  </Link>
                  <Link href="/admin/workers">
                    <Button variant="outline" className="w-full h-24 text-lg">
                      Manage Workers
                    </Button>
                  </Link>
                </>
              )}

              {user.role === 'WORKER' && (
                <Link href="/worker">
                  <Button className="w-full h-24 text-lg">
                    My Assignments
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Welcome to IIT Ropar Problem Ticket System
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Efficiently manage and track problem tickets. Students can raise tickets, 
                admins can assign them to workers, and workers can complete the tasks.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  Sign Up (Student)
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
