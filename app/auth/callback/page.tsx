'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL params
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          setIsProcessing(false);
          return;
        }

        if (code) {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Error exchanging code:', exchangeError);
            setError(exchangeError.message);
            setIsProcessing(false);
            return;
          }

          if (data.session) {
            // Wait a moment for the session to be fully established
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Redirect to dashboard
            router.push('/dashboard');
            return;
          }
        }

        // If no code, check if user is already authenticated
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md w-full p-8 space-y-4 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">
          {isProcessing ? 'Confirming your email...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
