'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: Record<string, string>) => {
    setError(null);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const userData = await response.json();

    // Redirect based on role
    if (userData.user.role === 'STUDENT') {
      router.push('/student');
    } else if (userData.user.role === 'ADMIN') {
      router.push('/admin');
    } else if (userData.user.role === 'WORKER') {
      router.push('/worker');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">IIT Ropar</h1>
          <p className="text-slate-400">Problem Ticket System</p>
        </div>

        <AuthForm
          title="Sign In"
          description="Log in to your account"
          submitButtonText="Sign In"
          fields={[
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'your.email@iitrpr.ac.in',
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: 'Enter your password',
            },
          ]}
          onSubmit={handleLogin}
          error={error}
        />

        <div className="text-center space-y-4">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up as a student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
