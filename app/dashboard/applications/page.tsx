'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseClient } from '@/lib/supabase/client';
import { TopHeader } from '@/components/top-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, CheckCircle, XCircle, Clock, Mail, User, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const { user } = useSupabaseAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super-admin';

  const loadEnrollments = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all enrollments with learner and cohort details
      const { data, error } = await supabaseClient
        .from('cohort_enrollments')
        .select(`
          *,
          learner:profiles!cohort_enrollments_learner_id_fkey(
            id,
            email,
            first_name,
            last_name,
            avatar_url,
            phone_number
          ),
          cohort:cohorts(
            id,
            name,
            description,
            status,
            start_date,
            end_date
          )
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInstructorOrAdmin) {
      loadEnrollments();
    }
  }, [user?.id, isInstructorOrAdmin]);

  const handleUpdateEnrollment = async (enrollmentId: string, newStatus: 'active' | 'rejected') => {
    setUpdatingId(enrollmentId);
    try {
      const { error } = await supabaseClient
        .from('cohort_enrollments')
        .update({ status: newStatus })
        .eq('id', enrollmentId);

      if (error) throw error;

      toast.success(newStatus === 'active' ? 'Application approved!' : 'Application rejected');
      await loadEnrollments(); // Reload data
    } catch (error: any) {
      console.error('Error updating enrollment:', error);
      toast.error(error?.message || 'Failed to update application');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isInstructorOrAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50/50">
        <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
        
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <Card>
            <CardContent className="py-12 text-center">
              <FileCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h3>
              <p className="text-slate-500">Only instructors and admins can view applications</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50/50">
        <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const rejectedEnrollments = enrollments.filter(e => e.status === 'rejected');

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-slate-500 mt-2">Review and manage learner enrollment applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{pendingEnrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{activeEnrollments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedEnrollments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingEnrollments.length > 0 && (
                <Badge className="ml-2 bg-amber-600 text-white">{pendingEnrollments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingEnrollments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Pending Applications</h3>
                  <p className="text-slate-500">All applications have been reviewed</p>
                </CardContent>
              </Card>
            ) : (
              pendingEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border-amber-100 bg-amber-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {enrollment.learner?.first_name} {enrollment.learner?.last_name}
                            </h3>
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              Pending
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="w-4 h-4" />
                              {enrollment.learner?.email}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="w-4 h-4" />
                              <span className="font-medium">Cohort:</span> {enrollment.cohort?.name}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Applied:</span> {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {enrollment.cohort?.description && (
                            <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                              {enrollment.cohort.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleUpdateEnrollment(enrollment.id, 'active')}
                          disabled={updatingId === enrollment.id}
                          className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {updatingId === enrollment.id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateEnrollment(enrollment.id, 'rejected')}
                          disabled={updatingId === enrollment.id}
                          className="border-red-200 text-red-600 hover:bg-red-50 min-w-[120px]"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-4">
            {activeEnrollments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Approved Applications</h3>
                  <p className="text-slate-500">Approved applications will appear here</p>
                </CardContent>
              </Card>
            ) : (
              activeEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border-emerald-100">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {enrollment.learner?.first_name} {enrollment.learner?.last_name}
                          </h3>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Active
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {enrollment.learner?.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Cohort:</span> {enrollment.cohort?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" className="space-y-4">
            {rejectedEnrollments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Rejected Applications</h3>
                  <p className="text-slate-500">Rejected applications will appear here</p>
                </CardContent>
              </Card>
            ) : (
              rejectedEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border-red-100 bg-red-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-7 h-7 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {enrollment.learner?.first_name} {enrollment.learner?.last_name}
                          </h3>
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            Rejected
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {enrollment.learner?.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Cohort:</span> {enrollment.cohort?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* All Tab */}
          <TabsContent value="all" className="space-y-4">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {enrollment.learner?.first_name} {enrollment.learner?.last_name}
                        </h3>
                        <Badge 
                          className={
                            enrollment.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            enrollment.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }
                        >
                          {enrollment.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {enrollment.learner?.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">Cohort:</span> {enrollment.cohort?.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
