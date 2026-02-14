
import React from 'react';
import { View, User } from '../types';

interface SidebarProps {
  user: User | null;
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  onViewChange,
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'upload', label: 'Upload Notes', icon: 'cloud_upload' },
    { id: 'summarize', label: 'Summarize', icon: 'summarize' },
    { id: 'quiz', label: 'Generate Quiz', icon: 'quiz' },
    { id: 'ask', label: 'Ask AI', icon: 'psychology' },
    { id: 'planner', label: 'Study Planner', icon: 'calendar_today' },
  ];

  return (
    <>
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onCloseMobile}
      />
      <aside
        className={`w-72 h-screen fixed left-0 top-0 border-r border-primary/10 bg-background-dark/95 lg:bg-background-dark/50 backdrop-blur-xl flex flex-col p-6 z-50 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="lg:hidden flex justify-end mb-4">
          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-lg bg-white/5 text-slate-300 flex items-center justify-center"
            aria-label="Close navigation"
          >
            <span className="material-icons-round text-base">close</span>
          </button>
        </div>
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => onViewChange('dashboard')}>
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-icons-round text-background-dark">auto_stories</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">StudyMate</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            id={`nav-${item.id}`}
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === item.id
                ? 'bg-primary text-background-dark font-medium shadow-lg'
                : 'text-slate-400 hover:text-primary hover:bg-primary/10'
            }`}
          >
            <span className="material-icons-round">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-primary/10">
        <div className="flex items-center gap-3 px-2 group">
          <img
            className="w-10 h-10 rounded-full object-cover border border-primary/20"
            alt={user?.name || 'User'}
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=D6CFE1&color=18171b`}
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'Premium Member'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-slate-400 hover:text-rose-500 transition-colors"
            title="Logout"
          >
            <span className="material-icons-round text-sm">logout</span>
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
