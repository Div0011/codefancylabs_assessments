'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, AlertTriangle, Zap, FolderOpen, CheckSquare, BarChart3, Users2 } from 'lucide-react';
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
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-full bg-sav-surface/85" />
          <div className="h-4 w-72 animate-pulse rounded-full bg-sav-surface/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-sav-surface/75 border border-sav-gold/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 animate-pulse rounded-3xl bg-sav-surface/75 border border-sav-gold/5" />
          <div className="h-96 animate-pulse rounded-3xl bg-sav-surface/75 border border-sav-gold/5" />
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 text-red-700 backdrop-blur-md max-w-2xl mx-auto mt-10">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <p className="font-semibold">{error}</p>
      </div>
      <p className="text-sm mt-1 text-red-600/80">Please ensure the backend NestJS server is running on port 3001 and connected to the database.</p>
    </div>
  );
  if (!stats) return null;

  const cards = [
    { 
      title: 'Active Projects', 
      value: stats.activeProjects, 
      icon: FolderOpen, 
      bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5', 
      border: 'border-amber-500/10 hover:border-amber-500/30',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100/80 text-amber-700',
      description: 'On-track status'
    },
    { 
      title: 'Pending Tasks', 
      value: stats.pendingTasks, 
      icon: Clock, 
      bg: 'bg-gradient-to-br from-sav-gold/10 to-sav-gold/5', 
      border: 'border-sav-gold/10 hover:border-sav-gold/30',
      text: 'text-sav-gold-dark',
      iconBg: 'bg-sav-gold-pale/50 text-sav-gold-dark',
      description: 'Awaiting execution'
    },
    { 
      title: 'Overdue Tasks', 
      value: stats.overdueTasks, 
      icon: AlertTriangle, 
      bg: cn(stats.overdueTasks > 0 ? 'bg-gradient-to-br from-red-500/8 via-red-500/3 to-transparent' : 'bg-gradient-to-br from-gray-500/10 to-gray-500/5'), 
      border: cn(stats.overdueTasks > 0 ? 'border-red-200 hover:border-red-400' : 'border-gray-200 hover:border-gray-300'),
      text: stats.overdueTasks > 0 ? 'text-red-600 font-bold' : 'text-gray-700',
      iconBg: stats.overdueTasks > 0 ? 'bg-red-100 text-red-600 animate-bounce' : 'bg-gray-100 text-gray-500',
      description: stats.overdueTasks > 0 ? 'Requires attention' : 'All caught up'
    },
    { 
      title: 'High Priority', 
      value: stats.highPriorityPending, 
      icon: Zap, 
      bg: 'bg-gradient-to-br from-sav-bronze/12 to-sav-bronze/5', 
      border: 'border-sav-bronze/15 hover:border-sav-bronze/35',
      text: 'text-sav-bronze',
      iconBg: 'bg-sav-tan/30 text-sav-bronze',
      description: 'Critical deadlines'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-sav-text tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-sav-bronze font-medium">Real-time status updates and workspace allocation analytics.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-sav-gold/15 shadow-[0_2px_8px_rgba(90,77,28,0.03)] text-xs font-semibold text-sav-gold-dark">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sync complete</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className={cn(
                'sav-card group transition-all duration-300', 
                card.bg, 
                card.border
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-sav-bronze">{card.title}</p>
                  <p className={cn('text-4xl font-extrabold tracking-tight', card.text)}>{card.value}</p>
                </div>
                <div className={cn('rounded-2xl p-2.5 transition-transform duration-300 group-hover:scale-110 shadow-sm', card.iconBg)}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-sav-gold/5 flex items-center justify-between text-[11px] font-semibold text-sav-bronze/80">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-sav-gold" />
                  <span>{card.description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects Card */}
        <div className="sav-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-sav-text flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-sav-gold" />
                  <span>Recent Projects Progress</span>
                </h2>
                <p className="text-xs text-sav-bronze/80 mt-0.5">Task completion metrics of the 5 latest projects.</p>
              </div>
              <span className="rounded-full bg-sav-surface px-3 py-1.5 text-[10px] font-bold text-sav-gold-dark border border-sav-gold/15">Active Sync</span>
            </div>

            <div className="space-y-5">
              {stats.recentProjects.map((project: any) => {
                const totalTasks = project.tasks?.length || 0;
                const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div 
                    key={project.id} 
                    className="group/item rounded-2xl border border-sav-gold/10 bg-white/40 p-4 transition-all duration-300 hover:bg-white/90 hover:border-sav-gold/25 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-sav-text truncate group-hover/item:text-sav-gold-dark transition-colors">{project.name}</p>
                        <p className="text-[11px] font-semibold text-sav-bronze mt-0.5">{project.client.name}</p>
                      </div>
                      <Badge variant={project.status === 'COMPLETED' ? 'success' : project.status === 'ACTIVE' ? 'info' : 'default'} dot>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-sav-bronze">
                        <span>Progress: {progress}%</span>
                        <span>{completedTasks}/{totalTasks} Tasks</span>
                      </div>
                      <div className="h-2 w-full bg-sav-surface rounded-full overflow-hidden border border-sav-gold/5">
                        <div 
                          className="h-full bg-gradient-to-r from-sav-gold-bright to-sav-gold rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Tasks Card */}
        <div className="sav-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-sav-text flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-sav-gold" />
                  <span>Recent Tasks Timeline</span>
                </h2>
                <p className="text-xs text-sav-bronze/80 mt-0.5">Timeline updates of the 5 latest task records.</p>
              </div>
              <span className="rounded-full bg-sav-surface px-3 py-1.5 text-[10px] font-bold text-sav-gold-dark border border-sav-gold/15">Activity</span>
            </div>

            <div className="space-y-4">
              {stats.recentTasks.map((task: any) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

                return (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between rounded-2xl border border-sav-gold/10 bg-white/40 p-4 transition-all duration-300 hover:bg-white/90 hover:border-sav-gold/25 shadow-sm group/task"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isOverdue && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />}
                        <p className="text-sm font-bold text-sav-text truncate group-hover/task:text-sav-gold-dark transition-colors">{task.title}</p>
                      </div>
                      <p className="text-[11px] font-semibold text-sav-bronze/80 truncate mt-0.5">{task.project.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-sav-text/60 bg-sav-surface px-2.5 py-0.5 rounded-full border border-sav-gold/5 flex items-center gap-1">
                          <Users2 className="h-3 w-3 text-sav-bronze" />
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                        {task.dueDate && (
                          <span className={cn('text-[10px] font-semibold', isOverdue ? 'text-red-500 font-bold' : 'text-sav-bronze/60')}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Badge variant={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'default'} dot>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
