'use client';

import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { TopHeader } from '@/components/top-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';

export default function ApplicationsPage() {
  const { user } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-slate-500 mt-2">Review enrollment applications</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileCheck className="h-6 w-6 text-indigo-600" />
              <CardTitle>Coming Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Application management features are being developed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
