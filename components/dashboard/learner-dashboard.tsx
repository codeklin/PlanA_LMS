'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { StatCard } from '@/components/stat-card';
import { CourseCard } from '@/components/course-card';
import { TaskCard } from '@/components/task-card';
import { TopHeader } from '@/components/top-header';
import { CalendarWidget } from '@/components/calendar-widget';
import { UpcomingEvents } from '@/components/upcoming-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, Award, Users, TrendingUp, AlertCircle, FileText, Calendar, Sparkles, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { JoinCohortView } from '@/components/cohort-updates/join-cohort-view';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LearnerDashboard() {
    const { user } = useSupabaseAuth();
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [progress, setProgress] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [needsCohort, setNeedsCohort] = useState(false);

    const loadData = async () => {
        try {
            setIsLoading(true);
            if (user?.id) {
                // Get enrollments
                const enrollmentsData = await supabaseApi.getMyEnrollments();
                setEnrollments(enrollmentsData);

                // Get progress
                const progressData = await supabaseApi.getLearnerProgress(user.id);
                setProgress(progressData);

                // Get courses
                const coursesData = await supabaseApi.getCourses();
                setCourses(coursesData);

                // Check if user has any active enrollments
                const hasActiveEnrollment = enrollmentsData.some(
                    (e: any) => e.status === 'active' || e.status === 'approved'
                );
                setNeedsCohort(!hasActiveEnrollment);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50/50">
                <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
                <div className="p-8 space-y-8 max-w-7xl mx-auto">
                    <div className="h-64 bg-slate-200 animate-pulse rounded-[32px] w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (needsCohort) {
        return <JoinCohortView onJoinSuccess={loadData} />;
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-20">
            <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
                {/* Hero Section - PlanA Style */}
                <div className="relative overflow-hidden rounded-[32px] p-8 md:p-14 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}>
                    <div className="relative z-10 max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider">
                            <Zap className="w-3 h-3" /> Gig-Ready Training Active
                        </div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                            Welcome back, {user?.first_name}! 👋
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                            {enrollments.length > 0 
                                ? `You're enrolled in ${enrollments.length} project${enrollments.length > 1 ? 's' : ''}. Keep building your portfolio!`
                                : "Ready to start your gig economy journey? Enroll in a project to get started."}
                        </p>

                        <div className="flex gap-4 pt-2">
                            <Button 
                                onClick={() => router.push('/dashboard/courses')} 
                                className="rounded-xl h-12 px-8 font-bold shadow-lg active:scale-95 transition-all"
                                style={{ backgroundColor: '#2E5EFF', color: 'white' }}
                            >
                                View Projects
                            </Button>
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full blur-3xl opacity-30 animate-pulse" style={{ backgroundColor: '#F7931E' }} />
                </div>

                {/* Stats Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-3 text-slate-900">
                            Your Progress
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-4">
                        <StatCard
                            icon={BookOpen}
                            label="Active Projects"
                            value={enrollments.filter((e: any) => e.status === 'active').length}
                            iconColor="text-orange-600"
                            iconBgColor="bg-orange-50"
                        />
                        <StatCard
                            icon={GraduationCap}
                            label="Completed Tasks"
                            value={progress.reduce((acc: number, p: any) => acc + (p.completed_lessons?.length || 0), 0)}
                            iconColor="text-emerald-600"
                            iconBgColor="bg-emerald-50"
                        />
                        <StatCard
                            icon={Award}
                            label="Portfolio Pieces"
                            value={progress.filter((p: any) => p.completion_percentage === 100).length}
                            iconColor="text-blue-600"
                            iconBgColor="bg-blue-50"
                        />
                        <StatCard
                            icon={Zap}
                            label="Gig-Ready Score"
                            value={`${Math.round(progress.reduce((acc: number, p: any) => acc + (p.completion_percentage || 0), 0) / (progress.length || 1))}%`}
                            iconColor="text-purple-600"
                            iconBgColor="bg-purple-50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Current Courses */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between lg:pr-4">
                                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
                                    Your Projects
                                </h2>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => router.push('/dashboard/courses')} 
                                    className="font-bold hover:bg-orange-50 rounded-xl"
                                    style={{ color: '#FF6B35' }}
                                >
                                    Explore All
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses && courses.length > 0 ? (
                                    courses.slice(0, 4).map((course: any) => {
                                        const courseProgress = progress.find((p: any) => p.course_id === course.id);
                                        return (
                                            <div key={course.id} onClick={() => router.push(`/dashboard/courses/${course.id}`)} className="cursor-pointer group">
                                                <CourseCard
                                                    title={course.title}
                                                    subtitle={course.description?.substring(0, 100) + '...'}
                                                    icon="🚀"
                                                    progress={courseProgress?.completion_percentage || 0}
                                                    duration={`${course.estimated_hours || 0}h Total`}
                                                    instructor="PlanA Mentor"
                                                    color="orange"
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full rounded-[32px] border-dashed border-2 border-slate-200 p-14 text-center space-y-4 bg-slate-50/50">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                            <BookOpen className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <p className="font-semibold text-slate-900">No Projects Yet</p>
                                            <p className="text-slate-500 mt-1 text-sm leading-relaxed">Enroll in a cohort to start building your portfolio.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div className="space-y-6">
                            <h2 className="md:text-2xl text-xl font-semibold tracking-tight text-slate-900">
                                Next Deliverables
                            </h2>
                            <div className="space-y-4">
                                {enrollments.length > 0 ? (
                                    enrollments.slice(0, 3).map((enrollment: any) => (
                                        <div key={enrollment.id} className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 transition-all hover:shadow-xl hover:border-orange-100 hover:-translate-y-1">
                                            <div className="flex items-center gap-6">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:text-white transition-all duration-300" style={{ backgroundColor: 'var(--hover-bg, #f8fafc)' }}>
                                                    <FileText className="h-7 w-7" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-slate-100">Project</Badge>
                                                        {enrollment.status === 'active' && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-bold uppercase tracking-widest">Active</Badge>}
                                                    </div>
                                                    <h4 className="font-semibold text-lg text-slate-900 truncate group-hover:text-orange-600 transition-colors uppercase tracking-tight">{enrollment.cohort?.name || 'Project'}</h4>
                                                    <p className="text-sm text-slate-500 font-medium">Status: {enrollment.status}</p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="rounded-xl px-5 h-10 font-bold border-slate-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-50" 
                                                    onClick={() => router.push(`/dashboard/cohorts/${enrollment.cohort_id}`)}
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[32px] border border-dashed border-slate-200 p-14 text-center bg-orange-50/30 space-y-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Ready to Start?</p>
                                            <p className="text-slate-600 text-sm">Enroll in a project to begin building your gig-ready portfolio.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8 sticky top-24">
                        <div className="rounded-[32px] border border-slate-100 bg-white md:p-8 px-4 p-6 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <h3 className="md:text-xl text-lg font-semibold text-slate-900">
                                    Quick Stats
                                </h3>
                                <p className="text-sm text-slate-500">Your gig-ready journey</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">Portfolio Pieces</span>
                                        <span className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
                                            {progress.filter((p: any) => p.completion_percentage === 100).length}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500">Ready to show clients</div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">Active Projects</span>
                                        <span className="text-2xl font-bold" style={{ color: '#2E5EFF' }}>
                                            {enrollments.filter((e: any) => e.status === 'active').length}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500">In progress</div>
                                </div>
                            </div>
                        </div>

                        {/* Motivation Card */}
                        <div className="rounded-[32px] p-8 text-white relative overflow-hidden group shadow-lg" style={{ background: 'linear-gradient(135deg, #2E5EFF 0%, #1E3A8A 100%)' }}>
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-lg font-bold leading-tight italic">"Build real projects. Get gig-ready. Start earning."</h4>
                                <div className="h-1 w-12 bg-white/30 rounded-full" />
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">— The PlanA Way</p>
                            </div>
                            <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
