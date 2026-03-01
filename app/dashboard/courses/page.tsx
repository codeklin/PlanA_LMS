'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseClient } from '@/lib/supabase/client';
import { supabaseApi } from '@/lib/supabase-api';
import { TopHeader } from '@/components/top-header';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Plus, Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function CoursesPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super-admin';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimated_hours: 0,
    icon: '📚',
    is_published: false
  });

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await supabaseApi.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data, error } = await supabaseClient
        .from('courses')
        .insert({
          ...formData,
          created_by: user?.id,
          instructor_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Course created successfully!');
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        estimated_hours: 0,
        icon: '📚',
        is_published: false
      });
      await loadCourses();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error?.message || 'Failed to create course');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.name?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : undefined} />
      
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isInstructorOrAdmin ? 'Course Library' : 'Your Projects'}
            </h1>
            <p className="text-slate-500 mt-2">
              {isInstructorOrAdmin ? 'Manage and create courses for your cohorts' : 'Build real projects. Get gig-ready.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search courses..." 
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isInstructorOrAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl font-semibold" style={{ backgroundColor: '#FF6B35' }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Course</DialogTitle>
                    <DialogDescription>
                      Build a project-based course for your learners
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateCourse} className="space-y-6 mt-4">
                    {/* Course Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Course Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Full-Stack Web Development"
                        className="h-12"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What will students learn and achieve..."
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Category and Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g. Web Development"
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty *</Label>
                        <select
                          id="difficulty"
                          required
                          value={formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                          className="w-full h-12 px-3 rounded-md border border-slate-200 bg-white"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    {/* Hours and Icon */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estimated_hours">Estimated Hours *</Label>
                        <Input
                          id="estimated_hours"
                          type="number"
                          min="0"
                          required
                          value={formData.estimated_hours}
                          onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                          placeholder="e.g. 40"
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icon">Icon (Emoji)</Label>
                        <Input
                          id="icon"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          placeholder="📚"
                          className="h-12"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {/* Publish Toggle */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <input
                        type="checkbox"
                        id="is_published"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600"
                      />
                      <div>
                        <Label htmlFor="is_published" className="font-semibold cursor-pointer">
                          Publish immediately
                        </Label>
                        <p className="text-xs text-slate-500">Make visible to learners right away</p>
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="w-full h-12 font-semibold rounded-xl"
                      style={{ backgroundColor: '#FF6B35' }}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Course
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="relative group">
                <div 
                  onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                  className="cursor-pointer"
                >
                  <CourseCard
                    title={course.name}
                    subtitle={course.description?.substring(0, 100) + '...'}
                    icon={course.icon || '🚀'}
                    progress={0}
                    duration={`${course.estimated_hours || 0}h`}
                    instructor="PlanA Mentor"
                    color="orange"
                  />
                </div>
                {isInstructorOrAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className={course.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/instructor/courses/edit/${course.id}`);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? 'No courses found' : 'No Courses Yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : isInstructorOrAdmin 
                  ? 'Create your first course to get started'
                  : 'Enroll in a cohort to start building your portfolio'
              }
            </p>
            {isInstructorOrAdmin && !searchQuery && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            )}
            {!isInstructorOrAdmin && (
              <Button onClick={() => router.push('/dashboard')}>
                Browse Cohorts
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
