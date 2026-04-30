import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Settings, Zap, LogOut, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/app/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/app/team', icon: Users, label: 'Team' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/50
          flex flex-col transition-transform duration-300 ease-in-out h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-glow">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-800 tracking-tight">TaskFlow</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Menu</p>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-primary-400" />}
                </>
              )}
            </NavLink>
          ))}

          {/* Admin-only section */}
          {user?.role === 'admin' && (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-6 pt-3 border-t border-slate-200/50">
                Admin
              </p>
              <NavLink
                to="/app/settings"
                onClick={onClose}
                className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <Settings size={18} />
                    <span className="flex-1">Settings</span>
                    {isActive && <ChevronRight size={14} className="text-primary-400" />}
                  </>
                )}
              </NavLink>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-200/50 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100/50 transition-colors">
            <div className="w-9 h-9 bg-gradient-to-tr from-primary-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm border border-white/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-icon"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
