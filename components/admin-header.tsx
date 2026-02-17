'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  userName: string;
}

export function AdminHeader({ userName }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white hover:text-slate-200">
            IIT Ropar
          </Link>
          <nav className="flex  items-center gap-4">
            <Link href="/admin">
              <Button className='text-gray-200' variant="ghost">Pending Tickets</Button>
            </Link>
            <Link href="/admin/workers">
              <Button className='text-gray-200' variant="ghost">Manage Workers</Button>
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
              <span className="text-sm text-slate-400">{userName} (Admin)</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
