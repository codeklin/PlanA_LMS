'use client';

import { useEffect, useState } from 'react';
import { supabaseApi } from '@/lib/supabase-api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';

interface JoinCohortViewProps {
  onJoinSuccess?: () => void;
}

export function JoinCohortView({ onJoinSuccess }: JoinCohortViewProps) {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCohorts = async () => {
      try {
        const data = await supabaseApi.getCohorts();
        setCohorts(data.filter((c: any) => c.status === 'active'));
      } catch (error) {
        console.error('Error loading cohorts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCohorts();
  }, []);

  const handleEnroll = async (cohortId: string) => {
    try {
      await supabaseApi.enrollInCohort(cohortId);
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Join a Cohort</h1>
          <p className="text-slate-500 text-lg">Choose a cohort to start your gig-ready journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => (
            <Card key={cohort.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{cohort.name}</CardTitle>
                  <Badge style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                    {cohort.status}
                  </Badge>
                </div>
                <CardDescription>{cohort.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{cohort.max_learners || 0} max</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(cohort.start_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  style={{ backgroundColor: '#FF6B35' }}
                  onClick={() => handleEnroll(cohort.id)}
                >
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {cohorts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Cohorts</h3>
              <p className="text-slate-500">Check back soon for new cohorts</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
