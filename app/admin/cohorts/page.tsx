'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Calendar, Users, Edit, Trash2, Eye } from 'lucide-react';
import { supabaseApi } from '@/lib/supabase-api';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/lib/supabase-auth-context';

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  performance_threshold: number;
  weekly_target: number;
  grace_period_days: number;
  review_cycle_frequency: 'weekly' | 'bi-weekly' | 'monthly';
  max_learners: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminCohortsPage() {
  const { user } = useSupabaseAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'upcoming' as const,
    performance_threshold: 70,
    weekly_target: 10,
    grace_period_days: 3,
    review_cycle_frequency: 'weekly' as const,
    max_learners: 30,
  });

  useEffect(() => {
    loadCohorts();
  }, []);

  const loadCohorts = async () => {
    try {
      setIsLoading(true);
      const data = await supabaseApi.getCohorts();
      setCohorts(data);
    } catch (error) {
      console.error('Error loading cohorts:', error);
      toast.error('Failed to load cohorts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingCohort) {
        await supabaseApi.updateCohort(editingCohort.id, formData);
        toast.success('Cohort updated successfully');
      } else {
        await supabaseApi.createCohort(formData);
        toast.success('Cohort created successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadCohorts();
    } catch (error: any) {
      console.error('Error saving cohort:', error);
      toast.error(error.message || 'Failed to save cohort');
    }
  };

  const handleEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description || '',
      start_date: cohort.start_date.split('T')[0],
      end_date: cohort.end_date.split('T')[0],
      status: cohort.status,
      performance_threshold: cohort.performance_threshold,
      weekly_target: cohort.weekly_target,
      grace_period_days: cohort.grace_period_days,
      review_cycle_frequency: cohort.review_cycle_frequency,
      max_learners: cohort.max_learners,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cohort?')) return;

    try {
      await supabaseApi.deleteCohort(id);
      toast.success('Cohort deleted successfully');
      loadCohorts();
    } catch (error: any) {
      console.error('Error deleting cohort:', error);
      toast.error(error.message || 'Failed to delete cohort');
    }
  };

  const resetForm = () => {
    setEditingCohort(null);
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'upcoming',
      performance_threshold: 70,
      weekly_target: 10,
      grace_period_days: 3,
      review_cycle_frequency: 'weekly',
      max_learners: 30,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'archived': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Check if user is admin or instructor
  const canManageCohorts = user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'instructor';

  if (!canManageCohorts) {
    return (
      <div className="min-h-screen bg-neutral-50/50 p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">You don't have permission to manage cohorts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cohort Management</h1>
            <p className="text-slate-500 mt-2">Manage all cohorts across the platform</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Cohort
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCohort ? 'Edit Cohort' : 'Create New Cohort'}</DialogTitle>
                <DialogDescription>
                  {editingCohort ? 'Update cohort details' : 'Add a new cohort to the platform'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cohort Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Web Development Cohort 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the cohort"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_learners">Max Learners</Label>
                    <Input
                      id="max_learners"
                      type="number"
                      value={formData.max_learners}
                      onChange={(e) => setFormData({ ...formData, max_learners: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="performance_threshold">Performance Threshold (%)</Label>
                    <Input
                      id="performance_threshold"
                      type="number"
                      value={formData.performance_threshold}
                      onChange={(e) => setFormData({ ...formData, performance_threshold: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weekly_target">Weekly Target (hrs)</Label>
                    <Input
                      id="weekly_target"
                      type="number"
                      value={formData.weekly_target}
                      onChange={(e) => setFormData({ ...formData, weekly_target: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grace_period_days">Grace Period (days)</Label>
                    <Input
                      id="grace_period_days"
                      type="number"
                      value={formData.grace_period_days}
                      onChange={(e) => setFormData({ ...formData, grace_period_days: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review_cycle">Review Cycle Frequency</Label>
                  <Select value={formData.review_cycle_frequency} onValueChange={(value: any) => setFormData({ ...formData, review_cycle_frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                    {editingCohort ? 'Update Cohort' : 'Create Cohort'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading cohorts...</p>
            </CardContent>
          </Card>
        ) : cohorts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Cohorts Yet</h3>
              <p className="text-slate-500 mb-4">Create your first cohort to get started</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Cohort
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cohorts.map((cohort) => (
              <Card key={cohort.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{cohort.name}</CardTitle>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cohort.status)}`}>
                        {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cohort.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{cohort.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(cohort.start_date).toLocaleDateString()} - {new Date(cohort.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>Max {cohort.max_learners} learners</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(cohort)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(cohort.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
