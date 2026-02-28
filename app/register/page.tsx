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
import { Loader2, User, Mail, Lock, ArrowRight, Zap, CheckCircle2, GraduationCap, Briefcase, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(firstName, lastName, email, password, role);
      toast.success('Welcome to PlanA! Let\'s get you gig-ready.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30 relative overflow-hidden px-4 py-20">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 mx-auto mb-6">
            <Zap className="w-9 h-9" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            Join Plan<span className="text-primary">A</span>
          </h1>
          <p className="text-slate-600 text-sm font-semibold">Start your journey to the gig economy</p>
        </div>

        {/* Register Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 p-8">
            <CardTitle className="text-3xl font-bold text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-600 font-medium">Get gig-ready in 4-12 weeks. Zero theory, real projects.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    First Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="bg-slate-50 border-slate-200 h-14 pl-12 text-slate-900 placeholder:text-slate-400 focus:ring-primary/20 focus:border-primary rounded-2xl transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Last Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="bg-slate-50 border-slate-200 h-14 pl-12 text-slate-900 placeholder:text-slate-400 focus:ring-primary/20 focus:border-primary rounded-2xl transition-all"
                    />
                  </div>
                </div>
              </div>

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
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
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
                <div className="flex items-center gap-2 mt-2">
                  {password.length >= 6 ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <p className="text-xs text-slate-500 font-medium">At least 6 characters</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  I want to
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    onClick={() => !isLoading && setRole('learner')}
                    className={cn(
                      "cursor-pointer p-5 rounded-2xl border-2 transition-all space-y-3 group",
                      role === 'learner'
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                        : "bg-slate-50 border-slate-200 hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      role === 'learner' ? "bg-primary text-white" : "bg-white text-slate-400 group-hover:text-primary"
                    )}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", role === 'learner' ? "text-slate-900" : "text-slate-600")}>Learn & Build</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Get gig-ready with real projects</p>
                    </div>
                  </div>

                  <div
                    onClick={() => !isLoading && setRole('instructor')}
                    className={cn(
                      "cursor-pointer p-5 rounded-2xl border-2 transition-all space-y-3 group",
                      role === 'instructor'
                        ? "bg-secondary/5 border-secondary shadow-lg shadow-secondary/10"
                        : "bg-slate-50 border-slate-200 hover:border-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      role === 'instructor' ? "bg-secondary text-white" : "bg-white text-slate-400 group-hover:text-secondary"
                    )}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", role === 'instructor' ? "text-slate-900" : "text-slate-600")}>Teach & Mentor</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Guide learners to success</p>
                    </div>
                  </div>
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
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-600 font-medium">Already have an account? </span>
              <Link href="/login" className="text-primary font-bold hover:text-primary/80 transition-colors">
                Sign In
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
