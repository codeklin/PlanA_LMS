'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';

export default function CohortDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [cohort, setCohort] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCohort = async () => {
      try {
        if (params.id) {
          const data = await supabaseApi.getCohort(params.id as string);
          setCohort(data);
        }
      } catch (error) {
        console.error('Error loading cohort:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCohort();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Cohort Not Found</h3>
          <Button onClick={() => router.push('/dashboard/cohorts')}>
            Back to Cohorts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/cohorts')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cohorts
        </Button>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">{cohort.name}</h1>
          <p className="text-slate-500 mt-2 text-lg">{cohort.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cohort Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">
              Cohort details viewer is being developed. Check back soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
