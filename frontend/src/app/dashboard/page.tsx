'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, AlertTriangle, Zap, FolderOpen, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStats {
  activeProjects: number;
  pendingTasks: number;
  overdueTasks: number;
  highPriorityPending: number;
  recentProjects: any[];
  recentTasks: any[];
  projectsByStatus: { status: string; _count: { id: number } }[];
  tasksByStatus: { status: string; _count: { id: number } }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/dashboard/stats');
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 shrink-0 animate-pulse rounded-full bg-sav-surface" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 shrink-0 animate-pulse rounded-full bg-sav-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-600 font-medium">{error}</div>;
  if (!stats) return null;

  const cards = [
    { title: 'Active Projects', value: stats.activeProjects, icon: FolderOpen, color: 'from-sav-gold to-sav-bronze', bg: 'bg-sav-gold/10', text: 'text-sav-gold-dark' },
    { title: 'Pending Tasks', value: stats.pendingTasks, icon: Clock, color: 'from-sav-bronze to-sav-tan', bg: 'bg-sav-tan/40', text: 'text-sav-bronze' },
    { title: 'Overdue Tasks', value: stats.overdueTasks, icon: AlertTriangle, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700' },
    { title: 'High Priority Pending', value: stats.highPriorityPending, icon: Zap, color: 'from-sav-gold-dark to-sav-gold', bg: 'bg-sav-gold/10', text: 'text-sav-gold-dark' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-sav-text tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-sav-bronze">Overview of your project tracker</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="sav-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-sav-bronze">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-sav-text">{card.value}</p>
                </div>
                <div className={cn('rounded-2xl p-2.5', card.bg)}>
                  <Icon className={cn('h-5 w-5', card.text)} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>On track</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sav-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-sav-text">Recent Projects</h2>
            <span className="rounded-full bg-sav-surface px-3 py-1 text-xs font-semibold text-sav-bronze border border-gray-200">Latest 5</span>
          </div>
          <div className="space-y-3">
            {stats.recentProjects.map((project: any) => (
              <div key={project.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-sav-bg/50 p-3.5 transition-colors hover:bg-sav-surface">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-sav-text">{project.name}</p>
                  <p className="mt-0.5 text-xs text-sav-bronze">{project.client.name}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Badge variant={project.status === 'COMPLETED' ? 'success' : project.status === 'ACTIVE' ? 'info' : 'default'} dot>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sav-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-sav-text">Recent Tasks</h2>
            <span className="rounded-full bg-sav-surface px-3 py-1 text-xs font-semibold text-sav-bronze border border-gray-200">Latest 5</span>
          </div>
          <div className="space-y-3">
            {stats.recentTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-sav-bg/50 p-3.5 transition-colors hover:bg-sav-surface">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-sav-text">{task.title}</p>
                  <p className="mt-0.5 text-xs text-sav-bronze">{task.project.name}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Badge variant={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'default'} dot>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
