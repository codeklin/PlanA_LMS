'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { TopHeader } from '@/components/top-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';

export default function CohortsPage() {
  const { user } = useSupabaseAuth();
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCohorts = async () => {
      try {
        const data = await supabaseApi.getCohorts();
        setCohorts(data);
      } catch (error) {
        console.error('Error loading cohorts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCohorts();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohorts</h1>
          <p className="text-slate-500 mt-2">Join a cohort to start your gig-ready journey</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : cohorts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cohorts.map((cohort) => (
              <Card key={cohort.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cohort.name}</CardTitle>
                    <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}>
                      {cohort.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500">{cohort.description}</p>
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
                  <Button className="w-full" style={{ backgroundColor: '#FF6B35' }}>
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Cohorts Available</h3>
              <p className="text-slate-500">Check back soon for new cohorts</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
