'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (data: Record<string, string>) => {
    setError(null);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
        rollNumber: data.rollNumber,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Signup failed');
    }

    // Redirect to student dashboard
    router.push('/student');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">IIT Ropar</h1>
          <p className="text-slate-400">Problem Ticket System</p>
        </div>

        <AuthForm
          title="Create Student Account"
          description="Register to raise and track problem tickets"
          submitButtonText="Sign Up"
          fields={[
            {
              name: 'name',
              label: 'Full Name',
              type: 'text',
              placeholder: 'Enter your name',
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'your.email@iitrpr.ac.in',
            },
            {
              name: 'rollNumber',
              label: 'Roll Number',
              type: 'text',
              placeholder: 'Enter your roll number',
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: 'Create a strong password',
            },
          ]}
          onSubmit={handleSignup}
          error={error}
        />

        <div className="text-center space-y-4">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Log in here
            </Link>
          </p>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs text-slate-500 mb-3">Admin or Worker?</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Log in with different role
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
