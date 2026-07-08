'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, AlertTriangle, CheckSquare, Search } from 'lucide-react';
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
  HIGH: { color: 'bg-red-50 text-red-700 border-red-200', label: 'High', dot: true },
  MEDIUM: { color: 'bg-sav-gold/10 text-sav-gold-dark border-sav-gold/30', label: 'Medium', dot: true },
  LOW: { color: 'bg-sav-surface text-sav-text border-gray-200', label: 'Low', dot: true },
};

const statusConfig = {
  PENDING: { color: 'bg-sav-tan/40 text-sav-bronze border-sav-tan', label: 'Pending' },
  IN_PROGRESS: { color: 'bg-sav-gold/10 text-sav-gold-dark border-sav-gold/30', label: 'In Progress' },
  COMPLETED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
};

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return due < now;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '', projectId: '', assigneeId: '' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
  }, []);

  useEffect(() => {
    fetchTasks();
    apiClient.get('/projects').then((res) => setProjects(res.data));
  }, [filterStatus, filterPriority, filterProject]);

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || task.project.name.toLowerCase().includes(q);
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '', projectId: '', assigneeId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description || '', status: task.status, priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', projectId: task.project.id.toString(), assigneeId: task.assignee?.id.toString() || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTask) {
        await apiClient.patch(`/tasks/${editingTask.id}`, { ...formData, projectId: parseInt(formData.projectId) });
      } else {
        await apiClient.post('/tasks', { ...formData, projectId: parseInt(formData.projectId), assigneeId: formData.assigneeId ? parseInt(formData.assigneeId) : null });
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    await apiClient.delete(`/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sav-text tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-sav-bronze">Manage and track all project tasks</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>Add Task</Button>
      </div>

      <div className="sav-card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sav-bronze/60" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
              ]}
            />
            <Select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              options={[{ value: '', label: 'All Projects' }, ...projects.map((p) => ({ value: p.id.toString(), label: p.name }))]}
            />
          </div>
        </div>
      </div>

      <div className="sav-card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-sav-surface" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600 font-medium">{error}</div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-sav-bronze">
            <CheckSquare className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium text-sav-text">No tasks found</p>
            <p className="text-xs">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-sav-bg/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sav-bronze uppercase tracking-wider">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sav-bronze uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sav-bronze uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sav-bronze uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sav-bronze uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-sav-bronze uppercase tracking-wider">Assignee</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-sav-bronze uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate);
                  return (
                    <tr key={task.id} className="group transition-colors hover:bg-sav-bg/50">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {overdue && <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-sav-text truncate">{task.title}</p>
                            {task.description && <p className="text-xs text-sav-bronze truncate mt-0.5">{task.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm">
                          <p className="font-semibold text-sav-text">{task.project.name}</p>
                          <p className="text-xs text-sav-bronze">{task.project.client.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={task.status}
                          onChange={(e) => apiClient.patch(`/tasks/${task.id}`, { status: e.target.value }).then(() => fetchTasks()).catch((err: any) => alert(err.response?.data?.message || 'Failed to update status'))}
                          className={cn('rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sav-gold/20', statusConfig[task.status as keyof typeof statusConfig]?.color)}
                        >
                          {Object.entries(statusConfig).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'default'} dot>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn('text-xs font-semibold', overdue ? 'text-red-600' : 'text-sav-bronze')}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold text-sav-text bg-sav-surface px-2.5 py-1 rounded-full border border-gray-100">
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(task)} icon={<Pencil className="h-3.5 w-3.5" />} />
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
        title={editingTask ? 'Edit Task' : 'Add Task'}
        description={editingTask ? 'Update the task details below' : 'Create a new task for a project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Task title" />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Project"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              options={[{ value: '', label: 'Select a project' }, ...projects.map((p) => ({ value: p.id.toString(), label: p.name }))]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
            <Select
              label="Priority"
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
              label="Assignee"
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              options={[{ value: '', label: 'Unassigned' }, ...teamMembers.map((m) => ({ value: m.id.toString(), label: m.name }))]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Task'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
