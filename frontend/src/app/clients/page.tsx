'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
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
    if (!confirm('Are you sure you want to delete this client?')) return;
    await apiClient.delete(`/clients/${id}`);
    fetchClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sav-text tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-sav-bronze">Manage your client relationships</p>
        </div>
        <Button onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>Add Client</Button>
      </div>

      <div className="sav-card overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-sav-surface" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600 font-medium">{error}</div>
        ) : clients.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-sav-bronze">
            <ExternalLink className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium text-sav-text">No clients found</p>
            <p className="text-xs">Add your first client to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clients.map((client) => (
              <div key={client.id} className="group flex items-center justify-between p-4 transition-colors hover:bg-sav-bg/50">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sav-gold to-sav-bronze text-white font-bold text-sm shadow-[4px_4px_12px_rgba(53,43,11,0.06)]">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-sav-text truncate">{client.name}</h3>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-sav-bronze">
                      {client.email && <span className="truncate">{client.email}</span>}
                      {client.company && <span className="truncate">{client.company}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sav-bronze bg-sav-surface px-2.5 py-1.5 rounded-full border border-gray-200">
                    <ExternalLink className="h-3 w-3" />
                    {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(client)} icon={<Pencil className="h-3.5 w-3.5" />} />
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)} icon={<Trash2 className="h-3.5 w-3.5 text-red-500" />} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Client' : 'Add Client'}
        description={editingClient ? 'Update the client details below' : 'Fill in the information to add a new client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Client name" />
          <Input label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@example.com" />
          <Input label="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Company name" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
