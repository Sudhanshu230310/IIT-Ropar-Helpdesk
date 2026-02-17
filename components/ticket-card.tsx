'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: { name: string };
  createdAt: string;
  assignedTo?: { name: string };
  onVerify?: (ticketId: string) => void;
  isStudent?: boolean;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  DONE: 'bg-green-100 text-green-800',
  VERIFICATION_PENDING: 'bg-orange-100 text-orange-800',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-red-100 text-red-800',
};

export function TicketCard({
  id,
  title,
  description,
  status,
  priority,
  category,
  createdAt,
  assignedTo,
  onVerify,
  isStudent = false,
}: TicketCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{title}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {new Date(createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Link href={`/student/ticket/${id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{category.name}</Badge>
          <Badge className={priorityColors[priority] || priorityColors.MEDIUM}>
            {priority}
          </Badge>
          <Badge className={statusColors[status] || statusColors.PENDING}>
            {status}
          </Badge>
        </div>

        {assignedTo && (
          <p className="text-sm text-slate-600">
            <span className="font-medium">Assigned to:</span> {assignedTo.name}
          </p>
        )}

        {isStudent && status === 'COMPLETED' && (
          <Button
            size="sm"
            onClick={() => onVerify?.(id)}
            className="w-full"
          >
            Verify Completion
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
