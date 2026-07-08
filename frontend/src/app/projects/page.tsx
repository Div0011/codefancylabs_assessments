'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
  PLANNED: { color: 'bg-sav-surface text-sav-text border-gray-200', label: 'Planned' },
  ACTIVE: { color: 'bg-sav-gold/10 text-sav-gold-dark border-sav-gold/30', label: 'Active' },
  ON_HOLD: { color: 'bg-sav-tan/40 text-sav-bronze border-sav-tan', label: 'On Hold' },
  COMPLETED: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'PLANNED', clientId: '' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const [projectRes, clientRes] = await Promise.all([
        apiClient.get('/projects'),
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
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'PLANNED', clientId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '', status: project.status, clientId: project.client.id.toString() });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProject) {
        await apiClient.patch(`/projects/${editingProject.id}`, formData);
      } else {
        await apiClient.post('/projects', { ...formData, clientId: parseInt(formData.clientId) });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiClient.patch(`/projects/${id}/status`, { status });
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    await apiClient.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sav-text tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-sav-bronze">Track ongoing work for each client</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>Add Project</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-full bg-sav-surface" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-red-600 font-medium">{error}</div>
      ) : projects.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-full bg-sav-card border border-gray-200 text-sav-bronze">
          <p className="text-sm font-medium text-sav-text">No projects found</p>
          <p className="text-xs">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="sav-card group relative">
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-2xl bg-sav-surface p-2 border border-gray-100">
                  <span className="text-lg">📁</span>
                </div>
                <div className="flex items-center">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    className={cn('rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sav-gold/20', statusConfig[project.status as keyof typeof statusConfig]?.color)}
                  >
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <h3 className="text-sm font-bold text-sav-text mb-1.5 truncate">{project.name}</h3>
              <p className="text-xs text-sav-bronze mb-4 line-clamp-2">{project.description || 'No description provided'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs font-semibold text-sav-bronze bg-sav-surface px-2.5 py-1 rounded-full border border-gray-100">
                  {project.client.name}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-sav-bronze">
                  <span>{project.tasks.length}</span> task{project.tasks.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 hidden group-hover:flex justify-end gap-1 p-3 bg-gradient-to-t from-white via-white/80 to-transparent">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(project)} icon={<Pencil className="h-3.5 w-3.5" />} />
                <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)} icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        description={editingProject ? 'Update the project details below' : 'Create a new project for a client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Project name" />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
          <Select
            label="Client"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            options={[{ value: '', label: 'Select a client' }, ...clients.map((c) => ({ value: c.id.toString(), label: c.name }))]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Project'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
