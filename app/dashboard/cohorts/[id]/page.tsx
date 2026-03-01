'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseClient } from '@/lib/supabase/client';
import { supabaseApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Calendar, CheckCircle, XCircle, Clock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export default function CohortDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [cohort, setCohort] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super-admin';

  const loadData = async () => {
    try {
      if (params.id) {
        // Load cohort
        const cohortData = await supabaseApi.getCohort(params.id as string);
        setCohort(cohortData);

        // Load enrollments with learner profiles
        const { data: enrollmentsData, error } = await supabaseClient
          .from('cohort_enrollments')
          .select(`
            *,
            learner:profiles!cohort_enrollments_learner_id_fkey(
              id,
              email,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('cohort_id', params.id)
          .order('enrolled_at', { ascending: false });

        if (error) throw error;
        setEnrollments(enrollmentsData || []);
      }
    } catch (error) {
      console.error('Error loading cohort:', error);
      toast.error('Failed to load cohort details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleUpdateEnrollment = async (enrollmentId: string, newStatus: 'active' | 'rejected') => {
    setUpdatingId(enrollmentId);
    try {
      const { error } = await supabaseClient
        .from('cohort_enrollments')
        .update({ status: newStatus })
        .eq('id', enrollmentId);

      if (error) throw error;

      toast.success(newStatus === 'active' ? 'Enrollment approved!' : 'Enrollment rejected');
      await loadData(); // Reload data
    } catch (error: any) {
      console.error('Error updating enrollment:', error);
      toast.error(error?.message || 'Failed to update enrollment');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const rejectedEnrollments = enrollments.filter(e => e.status === 'rejected');

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

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{cohort.name}</h1>
            <p className="text-slate-500 mt-2 text-lg">{cohort.description}</p>
          </div>
          <Badge 
            variant="outline" 
            className="text-sm px-4 py-2"
            style={{ 
              backgroundColor: cohort.status === 'active' ? '#10b981' : '#94a3b8',
              color: 'white',
              borderColor: 'transparent'
            }}
          >
            {cohort.status}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Total Enrolled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{activeEnrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingEnrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {new Date(cohort.start_date).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Enrollments */}
        {isInstructorOrAdmin && pendingEnrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Pending Approvals ({pendingEnrollments.length})
              </CardTitle>
              <CardDescription>
                Review and approve learner enrollment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingEnrollments.map((enrollment) => (
                  <div 
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-amber-100 bg-amber-50/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {enrollment.learner?.first_name} {enrollment.learner?.last_name}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {enrollment.learner?.email}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateEnrollment(enrollment.id, 'active')}
                        disabled={updatingId === enrollment.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {updatingId === enrollment.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateEnrollment(enrollment.id, 'rejected')}
                        disabled={updatingId === enrollment.id}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Enrollments */}
        {activeEnrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Active Learners ({activeEnrollments.length})
              </CardTitle>
              <CardDescription>
                Currently enrolled and active in this cohort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeEnrollments.map((enrollment) => (
                  <div 
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 border border-slate-100 bg-white rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {enrollment.learner?.first_name} {enrollment.learner?.last_name}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {enrollment.learner?.email}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {enrollments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Enrollments Yet</h3>
              <p className="text-slate-500">Learners will appear here once they enroll in this cohort</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
