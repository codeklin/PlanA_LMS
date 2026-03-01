'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseClient } from '@/lib/supabase/client';
import { TopHeader } from '@/components/top-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, Mail, Calendar, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function LearnersPage() {
  const { user } = useSupabaseAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super-admin';

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all active enrollments with learner and cohort details
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
              phone_number,
              location,
              status
            ),
            cohort:cohorts(
              id,
              name,
              status,
              start_date,
              end_date
            )
          `)
          .eq('status', 'active')
          .order('enrolled_at', { ascending: false });

        if (error) throw error;
        
        setStudents(data || []);
        setFilteredStudents(data || []);
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      } finally {
        setIsLoading(false);
      }
    };

    if (isInstructorOrAdmin) {
      loadStudents();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, isInstructorOrAdmin]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter((enrollment) => {
        const learner = enrollment.learner;
        const cohort = enrollment.cohort;
        return (
          learner?.first_name?.toLowerCase().includes(query) ||
          learner?.last_name?.toLowerCase().includes(query) ||
          learner?.email?.toLowerCase().includes(query) ||
          cohort?.name?.toLowerCase().includes(query)
        );
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  if (!isInstructorOrAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50/50">
        <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
        
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h3>
              <p className="text-slate-500">Only instructors and admins can view learners</p>
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

  // Get unique learners (in case a learner is in multiple cohorts)
  const uniqueLearners = Array.from(
    new Map(students.map(s => [s.learner?.id, s])).values()
  );

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learners</h1>
          <p className="text-slate-500 mt-2">Manage and view all enrolled students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Total Learners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{uniqueLearners.length}</div>
              <p className="text-xs text-slate-500 mt-1">Unique students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Total Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{students.length}</div>
              <p className="text-xs text-slate-500 mt-1">Active enrollments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Active Cohorts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {new Set(students.map(s => s.cohort?.id)).size}
              </div>
              <p className="text-xs text-slate-500 mt-1">With students</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">All Students</CardTitle>
                <CardDescription>View enrolled learners and their cohorts</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  className="w-64 h-10 pl-9 rounded-xl bg-slate-50 border-transparent focus:bg-white" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {searchQuery ? 'No students found' : 'No Students Yet'}
                </h3>
                <p className="text-slate-500">
                  {searchQuery ? 'Try a different search term' : 'Students will appear here once they enroll in cohorts'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 text-left">
                      <th className="py-4 font-semibold text-xs text-slate-500 pl-8 uppercase tracking-wider">Student</th>
                      <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Cohort</th>
                      <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Enrolled</th>
                      <th className="py-4 font-semibold text-xs text-slate-500 pr-8 text-right uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredStudents.map((enrollment) => (
                      <tr key={enrollment.id} className="group hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-0">
                        <td className="py-5 pl-8">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={enrollment.learner?.avatar_url} />
                              <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                                {enrollment.learner?.first_name?.[0]}{enrollment.learner?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {enrollment.learner?.first_name} {enrollment.learner?.last_name}
                              </div>
                              {enrollment.learner?.location && (
                                <div className="text-xs text-slate-400">{enrollment.learner.location}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-3 h-3" />
                            {enrollment.learner?.email}
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="font-medium text-slate-700">{enrollment.cohort?.name}</div>
                              <div className="text-xs text-slate-400 capitalize">{enrollment.cohort?.status}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-5 pr-8 text-right">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                            Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
