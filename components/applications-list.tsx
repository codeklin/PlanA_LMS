'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';

export function ApplicationsList() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileCheck className="h-6 w-6 text-indigo-600" />
          <CardTitle>Applications</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-500">
          Application list component is being migrated to Supabase.
        </p>
      </CardContent>
    </Card>
  );
}
