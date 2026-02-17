'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentHeader } from '@/components/student-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    location: '',
    category: '',
    priority: 'Moderate',
    contactNumber: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }

        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (
        !formData.subject ||
        !formData.message ||
        !formData.location ||
        !formData.category
      ) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ticket');
      }

      router.push('/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <StudentHeader userName="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <StudentHeader userName={user?.name || 'Student'} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Raise a New Problem Ticket</CardTitle>
            <CardDescription>
              Describe your issue and we'll assign it to the appropriate team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  {error}
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Subject *
                </label>
                <Input
                  name="subject"
                  placeholder="Brief title of the problem"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description *
                </label>
                <textarea
                  name="message"
                  placeholder="Detailed description of the problem"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Location *
                </label>
                <Input
                  name="location"
                  placeholder="Hostel / Block / Room No."
                  value={formData.location}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Contact Number
                </label>
                <Input
                  name="contactNumber"
                  placeholder="Your contact number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/student')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
