'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, FolderKanban, Filter, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  client: { id: number; name: string };
  tasks: any[];
}

interface Client {
  id: number;
  name: string;
}

const statusConfig = {
  PLANNED: { color: 'bg-sav-surface text-sav-text border-sav-gold/10', label: 'Planned' },
  ACTIVE: { color: 'bg-sav-gold/10 text-sav-gold-dark border-sav-gold/25', label: 'Active' },
  ON_HOLD: { color: 'bg-sav-tan/40 text-sav-bronze border-sav-tan/60', label: 'On Hold' },
  COMPLETED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
};

function ProjectsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlClientId = searchParams.get('clientId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'PLANNED', clientId: '' });
  const [saving, setSaving] = useState(false);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>(urlClientId || '');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const url = selectedClientFilter ? `/projects?clientId=${selectedClientFilter}` : '/projects';
      const [projectRes, clientRes] = await Promise.all([
        apiClient.get(url),
        apiClient.get('/clients'),
      ]);
      setProjects(projectRes.data);
      setClients(clientRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedClientFilter]);

  // Sync state if url parameter changes
  useEffect(() => {
    if (urlClientId !== null) {
      setSelectedClientFilter(urlClientId);
    }
  }, [urlClientId]);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'PLANNED', clientId: selectedClientFilter || '' });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '', status: project.status, clientId: project.client.id.toString() });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject.id}`, { ...formData, clientId: parseInt(formData.clientId) });
        triggerToast('Project updated successfully.', 'success');
      } else {
        await apiClient.post('/projects', { ...formData, clientId: parseInt(formData.clientId) });
        triggerToast('Project registered successfully.', 'success');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to save project.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/projects/${id}/status`, { status });
      triggerToast('Project status updated.', 'success');
      fetchProjects();
    } catch (err: any) {
      // Catch business rule validation errors
      const errMsg = err.response?.data?.message || 'Failed to update project status.';
      triggerToast(errMsg, 'error');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project? This will remove all associated tasks.')) return;
    try {
      await apiClient.delete(`/projects/${id}`);
      triggerToast('Project deleted.', 'success');
      fetchProjects();
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Failed to delete project.', 'error');
    }
  };

  const clearClientFilter = () => {
    setSelectedClientFilter('');
    router.push('/projects');
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
          <h1 className="text-3xl font-extrabold text-sav-text tracking-tight">Projects Workspace</h1>
          <p className="mt-1 text-sm text-sav-bronze font-medium">Manage and track development stages, client linkages, and tasks.</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>Create Project</Button>
      </div>

      {/* Filter and Settings Deck */}
      <div className="sav-card flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-sav-bronze">
          <Filter className="h-4 w-4 text-sav-gold" />
          <span>Quick Filter:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedClientFilter}
            onChange={(e) => {
              setSelectedClientFilter(e.target.value);
              if (!e.target.value) {
                router.push('/projects');
              } else {
                router.push(`/projects?clientId=${e.target.value}`);
              }
            }}
            className="rounded-full border border-sav-gold/15 bg-white px-4 py-2 text-xs font-semibold text-sav-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sav-gold/20"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>
          {selectedClientFilter && (
            <button 
              onClick={clearClientFilter}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-sav-gold-dark hover:text-sav-gold bg-sav-surface px-3 py-2 rounded-full border border-sav-gold/10"
            >
              <span>Clear Filter</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-sav-surface/85 border border-sav-gold/5" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 text-red-700 max-w-2xl mx-auto">
          <p className="font-semibold">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-sav-gold/25 bg-white/40 backdrop-blur-md max-w-lg mx-auto mt-10">
          <FolderKanban className="h-10 w-10 text-sav-gold/60 mb-3" />
          <p className="text-sm font-bold text-sav-text">No projects found</p>
          <p className="text-xs text-sav-bronze mt-1 max-w-xs">There are no projects associated with the selected criteria. Try establishing a new project to get started.</p>
          <Button onClick={openCreateModal} className="mt-5" variant="secondary" icon={<Plus className="h-4 w-4" />}>
            Create New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div 
                key={project.id} 
                className="sav-card group flex flex-col justify-between h-full hover:border-sav-gold/30 hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="rounded-2xl bg-sav-surface p-2.5 border border-sav-gold/10 text-xl shadow-sm shrink-0">
                      📁
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sav-gold/20 cursor-pointer shadow-sm',
                          statusConfig[project.status as keyof typeof statusConfig]?.color
                        )}
                      >
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-sav-text mb-1 truncate group-hover:text-sav-gold-dark transition-colors duration-300">
                    {project.name}
                  </h3>
                  <p className="text-xs text-sav-bronze/90 line-clamp-2 leading-relaxed mb-5">
                    {project.description || 'No project scope description provided.'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Task completion slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-sav-bronze">
                      <span>Tasks completion: {progress}%</span>
                      <span>{completedTasks}/{totalTasks} Completed</span>
                    </div>
                    <div className="h-1.5 w-full bg-sav-surface rounded-full overflow-hidden border border-sav-gold/5">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-sav-gold-bright to-sav-gold'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-sav-gold/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sav-gold-dark bg-sav-surface px-2.5 py-1 rounded-full border border-sav-gold/10 truncate max-w-[130px]">
                      {project.client.name}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="ghost" size="sm" onClick={(e) => openEditModal(project, e)} icon={<Pencil className="h-3.5 w-3.5 text-sav-bronze" />} />
                      <Button variant="ghost" size="sm" onClick={(e) => handleDelete(project.id, e)} icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Modify Project Parameters' : 'Establish New Project'}
        description={editingProject ? 'Update current metadata and allocation variables.' : 'Configure a new project workspace linked to a client.'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Project Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Enter active project name" />
          <Input label="Project Scope / Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide context or deliverables outline" />
          <Select
            label="Associated Client"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            required
            options={[{ value: '', label: 'Select client linking...' }, ...clients.map((c) => ({ value: c.id.toString(), label: c.name }))]}
          />
          {editingProject && (
            <Select
              label="Project Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={Object.entries(statusConfig).map(([key, cfg]) => ({ value: key, label: cfg.label }))}
            />
          )}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-sav-gold/10">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Confirm project'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8 animate-fade-in">
        <div className="h-8 w-48 animate-pulse rounded-full bg-sav-surface/85" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-sav-surface/85 border border-sav-gold/5" />
          ))}
        </div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
