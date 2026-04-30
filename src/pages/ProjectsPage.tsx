import React, { useState } from 'react';
import { Plus, Search, Trash2, Calendar, FolderOpen } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../utils/helpers';
import { Project, ProjectStatus } from '../types';

const PROJECT_COLORS = ['#f97316','#3b82f6','#8b5cf6','#10b981','#ec4899','#f59e0b','#06b6d4','#ef4444'];

const defaultForm = {
  name: '', description: '', dueDate: '', status: 'active' as ProjectStatus, color: '#f97316',
};

export const ProjectsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, users, addProject, deleteProject } = useAppStore();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = projects.filter(p =>
    (statusFilter === 'all' || p.status === statusFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = () => {
    if (!form.name.trim()) { addToast('error', 'Project name is required.'); return; }
    const project: Project = {
      id: `p${Date.now()}`,
      name: form.name,
      description: form.description,
      status: form.status,
      progress: 0,
      createdBy: user?.id ?? 'u1',
      teamMembers: [user?.id ?? 'u1'],
      dueDate: form.dueDate || '2025-12-31',
      createdAt: new Date().toISOString().split('T')[0],
      color: form.color,
    };
    addProject(project);
    addToast('success', `Project "${project.name}" created!`);
    setShowModal(false);
    setForm(defaultForm);
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">{projects.length} projects total</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-10 h-11"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap bg-slate-100/50 p-1 rounded-xl backdrop-blur-sm border border-slate-200/50">
          {(['all', 'active', 'on_hold', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                statusFilter === s
                  ? 'bg-white text-primary-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
              }`}
            >
              {s === 'all' ? 'All' : s === 'on_hold' ? 'On Hold' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects found"
          description="Adjust your filters or create a new project to get started."
          action={user?.role === 'admin' ? (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Project
            </button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(p => {
            const members = p.teamMembers.map(id => users.find(u => u.id === id)).filter(Boolean);
            return (
              <div key={p.id} className="card card-hover p-6 flex flex-col h-full relative overflow-hidden group">
                {/* Decorative background blur */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[50px] opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:scale-125" style={{ background: p.color }} />
                
                <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center shadow-sm border border-slate-100" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                      <FolderOpen size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base leading-snug tracking-tight truncate max-w-[150px] sm:max-w-[180px]">{p.name}</h3>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </div>
                
                <p className="text-[13px] text-slate-500 leading-relaxed mb-6 line-clamp-2 flex-1 relative z-10 font-medium">{p.description}</p>

                {/* Progress */}
                <div className="mb-6 relative z-10 mt-auto">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                    <span>Progress</span>
                    <span className="text-slate-700">{p.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100/60 relative z-10">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar size={13} className="text-slate-400" />
                    {formatDate(p.dueDate)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Member avatars */}
                    <div className="flex">
                      {members.slice(0, 3).map((m, i) => m && (
                        <div key={m.id} className="border-2 border-white rounded-full shadow-sm" style={{ marginLeft: i > 0 ? -10 : 0 }}>
                          <Avatar name={m.name} size="sm" />
                        </div>
                      ))}
                      {members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white text-xs flex items-center justify-center text-slate-500 font-bold shadow-sm" style={{ marginLeft: -10 }}>
                          +{members.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Admin actions */}
                    {user?.role === 'admin' && (
                      <div className="pl-3 border-l border-slate-100">
                        <button
                          className="btn-icon bg-white hover:bg-red-50 border border-slate-100 shadow-sm transition-all"
                          onClick={() => setConfirmDelete(p.id)}
                          title="Delete project"
                        >
                          <Trash2 size={14} className="text-slate-400 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Project">
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="input-field"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Describe the project…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group mb-0">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Status</label>
              <select
                className="input-field cursor-pointer"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}
              >
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-lg transition-all"
                  style={{
                    background: c,
                    outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate}>
              <Plus size={16} /> Create Project
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteProject(confirmDelete!); addToast('success', 'Project deleted.'); }}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        danger
      />
    </div>
  );
};
