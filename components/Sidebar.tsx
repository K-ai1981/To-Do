import React from 'react';
import { 
  Layout, 
  CheckCircle2, 
  Circle, 
  Github, 
  Settings, 
  Plus,
  Rocket
} from 'lucide-react';
import { FilterType, GithubConfig } from '../types';

interface SidebarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onOpenGithubSettings: () => void;
  ghConfig: GithubConfig | null;
  onSyncGithub: () => void;
  isSyncing: boolean;
  totalTodos: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentFilter, 
  onFilterChange, 
  onOpenGithubSettings, 
  ghConfig,
  onSyncGithub,
  isSyncing,
  totalTodos
}) => {
  const isConnected = !!ghConfig;

  const filters = [
    { type: FilterType.ALL, icon: Layout, label: 'All Tasks' },
    { type: FilterType.ACTIVE, icon: Circle, label: 'Active' },
    { type: FilterType.COMPLETED, icon: CheckCircle2, label: 'Completed' },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 border-r border-slate-800 flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg shadow-lg shadow-brand-500/20">
            <Rocket size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </div>

        <nav className="space-y-1">
          {filters.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                currentFilter === type 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </div>
              {type === FilterType.ALL && totalTodos > 0 && (
                <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                  {totalTodos}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Integrations</h3>
        
        <div className="space-y-3">
          {isConnected ? (
             <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white">
                    <Github size={16} />
                    <span className="text-sm font-medium">{ghConfig.repo}</span>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>
                <button 
                  onClick={onSyncGithub}
                  disabled={isSyncing}
                  className="w-full mt-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      Sync Issues
                    </>
                  )}
                </button>
             </div>
          ) : (
            <button 
              onClick={onOpenGithubSettings}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-colors text-slate-400 hover:text-white group"
            >
              <Github size={18} className="group-hover:text-white transition-colors" />
              <span className="text-sm">Connect GitHub</span>
            </button>
          )}

          <button 
            onClick={onOpenGithubSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};