'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Worker {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function WorkersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create worker');
      }

      // Refresh workers list
      const workersRes = await fetch('/api/admin/workers');
      if (workersRes.ok) {
        const workersData = await workersRes.json();
        setWorkers(workersData.workers || []);
      }

      // Reset form
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <AdminHeader userName="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <AdminHeader userName={user?.name || 'Admin'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Manage Workers</h1>
              <p className="text-slate-400 mt-2">
                {workers.length} worker{workers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="ml-auto"
            >
              {showForm ? 'Cancel' : 'Add Worker'}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Worker</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Worker name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="worker@iitrpr.ac.in"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password *
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Set password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? 'Creating...' : 'Create Worker'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {workers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No workers yet. Add your first worker to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workers.map((worker) => (
                <Card key={worker.id}>
                  <CardHeader>
                    <CardTitle>{worker.name}</CardTitle>
                    <CardDescription>{worker.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      Added: {new Date(worker.createdAt).toLocaleDateString()}
                    </p>
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
