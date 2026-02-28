'use client';

import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckSquare } from 'lucide-react';

export default function TaskDetailPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/tasks')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckSquare className="h-6 w-6 text-green-600" />
              <CardTitle>Task Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Task detail viewer is being developed. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
