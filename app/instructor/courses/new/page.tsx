'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CourseForm } from '@/components/instructor/course-builder/course-form';
import { ModuleManager } from '@/components/instructor/course-builder/module-manager';
import { toast } from 'sonner';
import { supabaseApi } from '@/lib/supabase-api';

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [course, setCourse] = useState<any>(null);
  const [step, setStep] = useState<'details' | 'modules'>('details');

  const handleCourseCreated = (newCourse: any) => {
    setCourse(newCourse);
    setStep('modules');
  };

  const handleComplete = async () => {
    try {
      await supabaseApi.updateCourse(course.id, { is_published: true });
      toast.success('Course published successfully!');
      router.push('/dashboard/courses');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish course');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/courses')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
          <p className="text-slate-500 mt-2">Build a project-based course for learners</p>
        </div>

        {step === 'details' ? (
          <CourseForm onSuccess={handleCourseCreated} />
        ) : (
          <ModuleManager
            courseId={course.id}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>Set the essential information for your course</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  placeholder="Provide a compelling overview of what students will achieve..."
                  className="min-h-[120px]"
                />
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <select
                    id="difficulty"
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full h-12 px-3 rounded-md border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Estimated Hours and Icon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Publish Status */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <Label htmlFor="is_published" className="font-semibold cursor-pointer">
                    Publish immediately
                  </Label>
                  <p className="text-xs text-slate-500">Make this course visible to learners right away</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 font-semibold rounded-xl"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Course...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create Course
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
