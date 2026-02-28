'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
          <p className="text-slate-500 mt-2">Build a project-based course for learners</p>
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
              Course creation features are being developed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
