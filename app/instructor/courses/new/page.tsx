'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
