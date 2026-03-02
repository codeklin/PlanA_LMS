'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { supabaseApi } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurriculumView } from '@/components/course/curriculum-view';
import { ArrowLeft, BookOpen, Video, FileText } from 'lucide-react';
import { RichTextRenderer } from '@/components/shared/rich-text-renderer';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (params.courseId) {
          const data = await supabaseApi.getCourse(params.courseId as string);
          setCourse(data);
          // Auto-select first lesson if available
          if (data.modules && data.modules.length > 0 && data.modules[0].lessons && data.modules[0].lessons.length > 0) {
            setSelectedLesson(data.modules[0].lessons[0]);
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [params.courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Course Not Found</h3>
          <Button onClick={() => router.push('/dashboard/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <div className="flex h-screen">
        {/* Sidebar - Curriculum */}
        <div className="w-80 flex-shrink-0 overflow-hidden">
          {course.modules && course.modules.length > 0 ? (
            <CurriculumView
              modules={course.modules}
              activeLessonId={selectedLesson?.id}
              onSelectLesson={setSelectedLesson}
              completedLessonIds={[]}
              userId={user?.id}
            />
          ) : (
            <div className="p-6 text-center text-slate-500">
              <p>No curriculum available yet</p>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/courses')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>

            <div>
              <h1 className="text-4xl font-bold tracking-tight">{course.name}</h1>
              <p className="text-slate-500 mt-2 text-lg">{course.description}</p>
            </div>

            {selectedLesson ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {selectedLesson.video_url ? (
                        <Video className="w-6 h-6 text-indigo-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-indigo-600" />
                      )}
                      {selectedLesson.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedLesson.video_url && (
                      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                        <iframe
                          src={selectedLesson.video_url}
                          className="w-full h-full"
                          allowFullScreen
                          title={selectedLesson.name}
                        />
                      </div>
                    )}

                    {selectedLesson.content && (
                      <div className="prose max-w-none">
                        <RichTextRenderer content={selectedLesson.content} />
                      </div>
                    )}

                    {selectedLesson.assignment && (
                      <Card className="bg-amber-50 border-amber-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-amber-600" />
                            Assignment: {selectedLesson.assignment.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700">{selectedLesson.assignment.description}</p>
                          <div className="mt-4">
                            <Button className="bg-amber-600 hover:bg-amber-700">
                              Submit Assignment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500">
                    Select a lesson from the curriculum to begin learning.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
