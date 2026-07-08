'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Pencil, Trash2, Mail, Building2, Briefcase, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: number;
  name: string;
  email?: string;
  company?: string;
  projects: { id: number; name: string }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    try {
      const response = await apiClient.get('/clients');
      setClients(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', company: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name, email: client.email || '', company: client.company || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingClient) {
        await apiClient.patch(`/clients/${editingClient.id}`, formData);
      } else {
        await apiClient.post('/clients', formData);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client? This will delete all their projects and tasks.')) return;
    try {
      await apiClient.delete(`/clients/${id}`);
      fetchClients();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete client');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-sav-text tracking-tight">Clients Directory</h1>
          <p className="mt-1 text-sm text-sav-bronze font-medium">Manage and review client relationships and their digital operations.</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>Add New Client</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl bg-sav-surface/85 border border-sav-gold/5" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 text-red-700 max-w-2xl mx-auto">
          <p className="font-semibold">{error}</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-sav-gold/25 bg-white/40 backdrop-blur-md max-w-lg mx-auto mt-10">
          <Briefcase className="h-10 w-10 text-sav-gold/60 mb-3" />
          <p className="text-sm font-bold text-sav-text">No clients registered</p>
          <p className="text-xs text-sav-bronze mt-1 max-w-xs">Create your first client record to start tracking their websites, applications, and timelines.</p>
          <Button onClick={openCreateModal} className="mt-5" variant="secondary" icon={<PlusCircle className="h-4 w-4" />}>
            Register First Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="sav-card flex flex-col justify-between group h-full">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sav-gold-bright via-sav-gold to-sav-gold-dark text-white font-extrabold text-lg shadow-[0_4px_12px_rgba(189,162,55,0.15)] group-hover:scale-105 transition-transform duration-300">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-sav-text truncate group-hover:text-sav-gold-dark transition-colors duration-300">{client.name}</h3>
                    {client.company && (
                      <span className="inline-flex items-center gap-1 text-xs text-sav-bronze font-semibold mt-0.5">
                        <Building2 className="h-3.5 w-3.5 text-sav-gold" />
                        {client.company}
                      </span>
                    )}
                  </div>
                </div>

                {client.email && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-sav-text/80 bg-sav-surface/50 px-3.5 py-2 rounded-xl border border-sav-gold/5 truncate">
                    <Mail className="h-3.5 w-3.5 text-sav-bronze shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-sav-gold/5 flex items-center justify-between">
                <Link 
                  href={`/projects?clientId=${client.id}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-sav-gold-dark hover:text-sav-gold transition-colors"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{client.projects.length} Project{client.projects.length !== 1 ? 's' : ''}</span>
                </Link>
                
                <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(client)} icon={<Pencil className="h-3.5 w-3.5 text-sav-bronze" />} />
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)} icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Update Client Record' : 'Register New Client'}
        description={editingClient ? 'Modify parameters for the selected client relationship.' : 'Establish a new business relationship within the portal.'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Business or Client Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Enter client or enterprise name" />
          <Input label="Primary Contact Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@company.com" />
          <Input label="Parent Company / Organization" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Legal trading name" />
          <div className="flex justify-end gap-2.5 pt-4 border-t border-sav-gold/10">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Confirm Details'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
