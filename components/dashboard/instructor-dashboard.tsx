'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TopHeader } from '@/components/top-header';
import { toast } from 'sonner';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    Plus,
    BookOpen,
    Users,
    TrendingUp,
    MoreHorizontal,
    ArrowUpRight,
    GraduationCap,
    Calendar,
    Search,
    Filter,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function InstructorDashboard() {
    const { user } = useSupabaseAuth();
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeCohorts: 0,
        avgCompletion: 0
    });
    const [growthData, setGrowthData] = useState<any[]>([
        { name: 'Jan', students: 20 },
        { name: 'Feb', students: 35 },
        { name: 'Mar', students: 45 },
        { name: 'Apr', students: 60 },
        { name: 'May', students: 75 },
        { name: 'Jun', students: 85 },
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (user?.id) {
                    const allCohorts = await supabaseApi.getCohorts();
                    setCohorts(allCohorts);

                    // Calculate stats
                    const activeCohorts = allCohorts.filter((c: any) => c.status === 'active').length;
                    setStats({
                        totalStudents: allCohorts.reduce((acc: number, c: any) => acc + (c.max_learners || 0), 0),
                        activeCohorts,
                        avgCompletion: 78
                    });
                }
            } catch (error) {
                console.error('Error loading instructor dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user?.id]);

    const handleApplicationAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            // TODO: Implement application handling with Supabase
            toast.success(`Application ${action}d!`);
            // Refresh data
            if (action === 'approve') {
                setStats(prev => ({ ...prev, totalStudents: prev.totalStudents + 1 }));
            }
        } catch (error) {
            toast.error('Failed to process application');
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
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />

            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome Back, {user?.first_name}!</h1>
                        <p className="text-slate-500 mt-1">Manage your cohorts and track learner progress.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: '#FFF4F0' }}>
                                    <BookOpen className="w-6 h-6" style={{ color: '#FF6B35' }} />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: '#FFF4F0', color: '#FF6B35' }}>
                                    <ArrowUpRight className="w-3 h-3" /> Active
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Cohorts</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{cohorts.length}</span>
                                    <span className="text-sm text-slate-400">projects</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: '#EEF2FF' }}>
                                    <Users className="w-6 h-6" style={{ color: '#2E5EFF' }} />
                                </div>
                                <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> +10 this month
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Learners</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stats.totalStudents}</span>
                                    <span className="text-sm text-slate-400">enrolled</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <Zap className="w-6 h-6 text-emerald-600" />
                                </div>
                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +6% improvement
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Completion</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stats.avgCompletion}%</span>
                                    <span className="text-sm text-slate-400">gig-ready</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Growth Chart */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-2xl border-slate-100 shadow-sm h-full overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-slate-900">Learner Growth</CardTitle>
                                        <CardDescription>Track enrollment trends over time</CardDescription>
                                    </div>
                                    <select className="text-xs font-medium border-0 bg-slate-50 rounded-lg p-2.5 text-slate-600 outline-none ring-1 ring-slate-100 cursor-pointer">
                                        <option>This Year</option>
                                        <option>Last Year</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData}>
                                            <defs>
                                                <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="students"
                                                stroke="#FF6B35"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#colorOrange)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <Card className="rounded-2xl border-slate-100 shadow-sm h-full">
                            <CardHeader className="bg-white border-b border-slate-50">
                                <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <Button className="w-full justify-start rounded-xl h-12 font-semibold" style={{ backgroundColor: '#FF6B35', color: 'white' }}>
                                        <Plus className="w-4 h-4 mr-2" /> Create New Cohort
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 font-semibold border-slate-200">
                                        <Users className="w-4 h-4 mr-2" /> View All Learners
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 font-semibold border-slate-200">
                                        <BookOpen className="w-4 h-4 mr-2" /> Course Library
                                    </Button>
                                </div>

                                <div className="mt-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #2E5EFF 0%, #1E3A8A 100%)' }}>
                                    <div className="text-white space-y-2">
                                        <Zap className="w-8 h-8 mb-2" />
                                        <h4 className="font-bold text-sm">PlanA Tip</h4>
                                        <p className="text-xs text-blue-100 leading-relaxed">Focus on project-based learning. Every lesson should build something real.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Cohort Overview Table */}
                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-900">Cohort Overview</CardTitle>
                                <CardDescription>Managing {cohorts.length} active cohorts</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input className="w-64 h-10 pl-9 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all" placeholder="Search cohorts..." style={{ focusRingColor: '#FF6B35' }} />
                                </div>
                                <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 px-4">
                                    <Filter className="w-4 h-4 mr-2" /> Filter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-left">
                                        <th className="py-4 font-semibold text-xs text-slate-500 pl-8 uppercase tracking-wider">Cohort Name</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Learners</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Progress</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 pr-8 text-right uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {cohorts.map((cohort, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-0">
                                            <td className="py-5 pl-8">
                                                <div className="font-semibold text-slate-900">{cohort.name}</div>
                                                <div className="text-xs text-slate-400">{cohort.description}</div>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-700">{cohort.max_learners || 0}</span>
                                                    <span className="text-xs text-slate-400">max</span>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}
                                                    className={`rounded-full px-3 py-0.5 font-medium shadow-none whitespace-nowrap
                                                        ${cohort.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    {cohort.status === 'active' ? 'Active' : 'Draft'}
                                                </Badge>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                    {Math.floor(Math.random() * 30) + 60}%
                                                </div>
                                            </td>
                                            <td className="py-5 pr-8 text-right">
                                                <Link href={`/dashboard/cohorts/${cohort.id}`}>
                                                    <button className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-slate-400" style={{ hoverColor: '#FF6B35' }}>
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {cohorts.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                                No cohorts found. Create your first cohort to get started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
