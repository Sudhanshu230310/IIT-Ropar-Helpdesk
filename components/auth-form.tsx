'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormProps {
  title: string;
  description: string;
  submitButtonText: string;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder: string;
  }>;
  isLoading?: boolean;
  error?: string;
}

export function AuthForm({
  title,
  description,
  submitButtonText,
  onSubmit,
  fields,
  isLoading = false,
  error,
}: AuthFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                disabled={isSubmitting || isLoading}
                required
              />
            </div>
          ))}

          {localError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {localError}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full"
          >
            {isSubmitting ? 'Loading...' : submitButtonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
