'use client';

import React from "react"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30 relative overflow-hidden px-4">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[140px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 mx-auto mb-6">
            <Zap className="w-9 h-9" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Plan<span className="text-primary">A</span>
          </h1>
          <p className="text-slate-600 text-sm font-semibold">Get gig-ready. Fast.</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 p-8">
            <CardTitle className="text-3xl font-bold text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-600 font-medium">Sign in to continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-50 border-slate-200 h-14 pl-12 text-slate-900 placeholder:text-slate-400 focus:ring-primary/20 focus:border-primary rounded-2xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  <button type="button" className="text-xs font-bold text-secondary hover:text-secondary/80 uppercase tracking-wider transition-colors">
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-50 border-slate-200 h-14 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-primary/20 focus:border-primary rounded-2xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] group mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-600 font-medium">New to PlanA? </span>
              <Link href="/register" className="text-primary font-bold hover:text-primary/80 transition-colors">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pt-4">
          Built for the Nigerian gig economy 🇳🇬
        </p>
      </div>
    </div>
  );
}
