'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Rocket, Target, TrendingUp, ChevronRight, Clock, Award, Briefcase } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'super-admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-orange-50/30">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold">Loading PlanA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-orange-50/20 text-slate-900">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[140px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Zap className="w-7 h-7" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">
              Plan<span className="text-primary">A</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl px-6 h-11">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-primary/30">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-32 text-center">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-wider text-primary">
              <Zap className="w-4 h-4" /> High-Speed Learning
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
              Get Gig-Ready.<br />
              <span className="text-primary">Fast.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
              Zero theory. Real projects. Build your portfolio and start earning in the Nigerian gig economy in just <span className="text-primary font-bold">4-12 weeks</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 text-lg font-bold shadow-xl shadow-primary/30 transition-all active:scale-[0.98]">
                  Start Learning <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-2xl px-12 h-16 text-lg font-bold border-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                See Projects
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-primary">4-12</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Weeks to Gig-Ready</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary">100%</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Project-Based</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">0</div>
                <div className="text-sm text-slate-600 font-medium mt-1">Theory Lectures</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              The PlanA Way
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              High-speed, project-based learning designed for the gig economy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">1. Pick Your Project</h3>
              <p className="text-slate-600 leading-relaxed">
                Choose a real-world project that clients actually pay for. Landing pages, e-commerce stores, mobile apps - build what sells.
              </p>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-2 border-secondary/20 rounded-3xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6">
                <Rocket className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Build It Fast</h3>
              <p className="text-slate-600 leading-relaxed">
                Follow step-by-step tasks. No theory lectures. Just build, get feedback, improve. Complete projects in days, not months.
              </p>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Start Earning</h3>
              <p className="text-slate-600 leading-relaxed">
                Add to your portfolio. Connect to Upwork, Fiverr, Toptal. Win your first gig. We guide you from project to paycheck.
              </p>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-24 bg-white/50 rounded-3xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                Built for the Nigerian Gig Economy
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Every feature designed to get you from zero to earning. Fast.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">4-12 Week Cohorts</h4>
                    <p className="text-slate-600">Intensive, focused learning. No wasted time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Portfolio Pieces</h4>
                    <p className="text-slate-600">Every project becomes a case study you can show clients.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Gig Platform Ready</h4>
                    <p className="text-slate-600">Skills verified for Upwork, Fiverr, Toptal, and local clients.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-12 text-center">
              <div className="text-6xl font-bold text-slate-900 mb-4">₦300k+</div>
              <p className="text-xl text-slate-700 font-semibold mb-2">Average Monthly Earnings</p>
              <p className="text-slate-600">After completing 3 projects</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-32">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary rounded-[40px] p-16 md:p-24 text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Ready to Get Gig-Ready?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
              Join the next cohort. Build real projects. Start earning in the gig economy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl px-12 h-16 text-lg font-bold shadow-xl transition-all active:scale-[0.98]">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 rounded-2xl px-12 h-16 text-lg font-bold backdrop-blur-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                Plan<span className="text-primary">A</span>
              </div>
            </div>

            <p className="text-sm text-slate-500 font-medium">
              Built for the Nigerian gig economy 🇳🇬
            </p>

            <p className="text-xs text-slate-400 uppercase tracking-wider">© 2026 PlanA LMS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
