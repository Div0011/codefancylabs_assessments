'use client';

import { useEffect, useState, Suspense } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, AlertTriangle, AlertCircle, CheckSquare, Search, Filter, Calendar, User, SlidersHorizontal, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  project: { id: number; name: string; client: { id: number; name: string } };
  assignee?: { id: number; name: string };
}

interface Project {
  id: number;
  name: string;
}

interface TeamMember {
  id: number;
  name: string;
}

const priorityConfig = {
  HIGH: { color: 'bg-red-50 text-red-700 border-red-200/60', label: 'High', dot: true },
  MEDIUM: { color: 'bg-sav-gold/10 text-sav-gold-dark border-sav-gold/25', label: 'Medium', dot: true },
  LOW: { color: 'bg-sav-surface text-sav-text/80 border-sav-gold/10', label: 'Low', dot: true },
};

const statusConfig = {
  PENDING: { color: 'bg-sav-tan/40 text-sav-bronze border-sav-tan/60', label: 'Pending' },
  IN_PROGRESS: { color: 'bg-sav-gold/10 text-sav-gold-dark border-sav-gold/25', label: 'In Progress' },
  COMPLETED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
};

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return due < now;
}

function TasksContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '', projectId: '', assigneeId: '' });
  const [saving, setSaving] = useState(false);
  
  // Filters State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterProject) params.append('projectId', filterProject);
      const response = await apiClient.get(`/tasks?${params.toString()}`);
      setTasks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiClient.get('/team-members').then((res) => setTeamMembers(res.data));
    apiClient.get('/projects').then((res) => setProjects(res.data));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority, filterProject]);

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) || 
        task.project.name.toLowerCase().includes(q) || 
        (task.description && task.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '', projectId: projects[0]?.id.toString() || '', assigneeId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({ 
      title: task.title, 
      description: task.description || '', 
      status: task.status, 
      priority: task.priority, 
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', 
      projectId: task.project.id.toString(), 
      assigneeId: task.assignee?.id.toString() || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        projectId: parseInt(formData.projectId),
        assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      if (editingTask) {
        await apiClient.patch(`/tasks/${editingTask.id}`, payload);
        triggerToast('Task updated successfully.', 'success');
      } else {
        await apiClient.post('/tasks', payload);
        triggerToast('Task created successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Operation failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChangeInTable = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/tasks/${id}`, { status });
      triggerToast('Task status updated.', 'success');
      fetchTasks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to update task status.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiClient.delete(`/tasks/${id}`);
      triggerToast('Task removed from workspace.', 'success');
      fetchTasks();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to delete task.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Toast Notification Container */}
      {toast && (
        <div className={cn(
          'fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in max-w-sm',
          toast.type === 'success' 
            ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800' 
            : 'border-red-200 bg-red-50/95 text-red-800'
        )}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />}
          <div className="text-xs font-semibold">{toast.message}</div>
          <button onClick={() => setToast(null)} className="ml-auto rounded-full p-1 hover:bg-black/5 text-current/60 hover:text-current">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-sav-text tracking-tight">Taskboard</h1>
          <p className="mt-1 text-sm text-sav-bronze font-medium">Filter, allocate, and adjust task deliverables across clients.</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>Create Task</Button>
      </div>

      {/* Modern Collapsible Search and Filter Deck */}
      <div className="sav-card space-y-4 p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sav-bronze/70" />
            <input
              type="text"
              placeholder="Search by task title, description, or project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-sav-gold/15 bg-white/70 pl-11 pr-4 py-3 text-sm placeholder:text-sav-bronze/50 focus:border-sav-gold focus:outline-none focus:ring-2 focus:ring-sav-gold/15 transition-all duration-300"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold border transition-all duration-300 cursor-pointer shadow-sm",
              showFilters 
                ? "bg-sav-gold/10 text-sav-gold-dark border-sav-gold/30"
                : "bg-white text-sav-text border-sav-gold/15 hover:bg-sav-surface"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Collapsible Filters Deck */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-sav-gold/10 animate-fade-in">
            <div>
              <label className="block text-[11px] font-bold text-sav-bronze uppercase tracking-wider mb-1.5">Task Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-xl border border-sav-gold/15 bg-white px-3 py-2 text-xs font-semibold text-sav-text focus:outline-none focus:ring-2 focus:ring-sav-gold/15"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-sav-bronze uppercase tracking-wider mb-1.5">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full rounded-xl border border-sav-gold/15 bg-white px-3 py-2 text-xs font-semibold text-sav-text focus:outline-none focus:ring-2 focus:ring-sav-gold/15"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-sav-bronze uppercase tracking-wider mb-1.5">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full rounded-xl border border-sav-gold/15 bg-white px-3 py-2 text-xs font-semibold text-sav-text focus:outline-none focus:ring-2 focus:ring-sav-gold/15"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id.toString()}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Task List Table Card */}
      <div className="sav-card overflow-hidden p-0 border border-sav-gold/15 shadow-[0_4px_20px_-2px_rgba(90,77,28,0.04)]">
        {loading ? (
          <div className="space-y-4 p-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-sav-surface/85" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600 font-medium">{error}</div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-sav-bronze">
            <CheckSquare className="h-10 w-10 text-sav-gold/50 mb-3" />
            <p className="text-sm font-bold text-sav-text">No tasks matches the criteria</p>
            <p className="text-xs text-sav-bronze/80 mt-0.5">Try altering the filters or typing a different query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-sav-gold/10 bg-sav-surface/40">
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold text-sav-bronze uppercase tracking-wider">Task Info</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold text-sav-bronze uppercase tracking-wider">Project Scope</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold text-sav-bronze uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold text-sav-bronze uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold text-sav-bronze uppercase tracking-wider">Due Date</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold text-sav-bronze uppercase tracking-wider">Assignee</th>
                  <th className="px-5 py-4 text-right text-[11px] font-extrabold text-sav-bronze uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sav-gold/5 bg-white/30">
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate) && task.status !== 'COMPLETED';
                  return (
                    <tr key={task.id} className="group transition-all duration-300 hover:bg-white/90">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          {overdue ? (
                            <div className="rounded-full bg-red-100 p-1 shrink-0 animate-pulse mt-0.5">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                          ) : (
                            <div className="rounded-full bg-sav-surface p-1 shrink-0 mt-0.5">
                              <CheckSquare className="h-4 w-4 text-sav-gold" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-sav-text truncate group-hover:text-sav-gold-dark transition-colors duration-300">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-sav-bronze/90 mt-0.5 line-clamp-1 max-w-sm">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs">
                          <p className="font-bold text-sav-text truncate max-w-[150px]">{task.project.name}</p>
                          <p className="text-[10px] text-sav-bronze font-semibold mt-0.5">{task.project.client.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChangeInTable(task.id, e.target.value)}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sav-gold/20 cursor-pointer shadow-sm',
                            statusConfig[task.status as keyof typeof statusConfig]?.color
                          )}
                        >
                          {Object.entries(statusConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'default'} dot>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs font-semibold',
                          overdue ? 'text-red-600 font-bold' : 'text-sav-bronze/85'
                        )}>
                          <Calendar className="h-3.5 w-3.5" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sav-text bg-sav-surface px-3 py-1 rounded-full border border-sav-gold/10">
                          <User className="h-3 w-3 text-sav-bronze" />
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(task)} icon={<Pencil className="h-3.5 w-3.5 text-sav-bronze" />} />
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)} icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Update Task parameters' : 'Create Task Record'}
        description={editingTask ? 'Modify metadata and status details for the current task.' : 'Add a new deliverables item to the selected project.'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Task Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Enter active task title" />
          <Input label="Task Description / Details" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide work details, resources, or links" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Assigned Project"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
              options={[{ value: '', label: 'Select project...' }, ...projects.map((p) => ({ value: p.id.toString(), label: p.name }))]}
            />
            <Select
              label="Task Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
            <Select
              label="Task Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
              ]}
            />
            <Input label="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
            <Select
              label="Team Member Assignee"
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              options={[{ value: '', label: 'Unassigned' }, ...teamMembers.map((m) => ({ value: m.id.toString(), label: m.name }))]}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-sav-gold/10">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Confirm task'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8 animate-fade-in">
        <div className="h-8 w-48 animate-pulse rounded-full bg-sav-surface/85" />
        <div className="h-20 animate-pulse rounded-3xl bg-sav-surface/85" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-sav-surface/85 border border-sav-gold/5" />
          ))}
        </div>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
