'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function AdminCohortsPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Management</h1>
          <p className="text-slate-500 mt-2">Manage all cohorts across the platform</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-orange-600" />
              <CardTitle>Coming Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Cohort management features are being migrated to Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
