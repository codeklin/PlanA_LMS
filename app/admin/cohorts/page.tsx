'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCohortsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard cohorts page
    router.push('/dashboard/cohorts');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Redirecting to cohorts...</p>
      </div>
    </div>
  );
}
