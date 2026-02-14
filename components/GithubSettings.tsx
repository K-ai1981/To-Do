import React, { useState, useEffect } from 'react';
import { Github, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { GithubConfig } from '../types';
import { validateGithubToken } from '../services/githubService';

interface GithubSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: GithubConfig | null;
  onSave: (config: GithubConfig) => void;
}

export const GithubSettings: React.FC<GithubSettingsProps> = ({ isOpen, onClose, config, onSave }) => {
  const [token, setToken] = useState(config?.token || '');
  const [owner, setOwner] = useState(config?.owner || '');
  const [repo, setRepo] = useState(config?.repo || '');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen && config) {
      setToken(config.token);
      setOwner(config.owner);
      setRepo(config.repo);
    }
  }, [isOpen, config]);

  const handleSave = async () => {
    setStatus('validating');
    const isValid = await validateGithubToken(token);
    
    if (isValid) {
      setStatus('success');
      onSave({ token, owner, repo });
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1000);
    } else {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-900/5">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Github size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">GitHub Connection</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-brand-50 rounded-lg border border-brand-100 text-brand-800 text-sm">
            <p>Connect a repository to sync tasks as issues. You need a <strong>Personal Access Token (Classic)</strong> with `repo` scope.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Personal Access Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="ghp_..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Owner / User</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="facebook"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Repository</label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="react"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <AlertCircle size={16} />
              <span>Invalid Token or Connection Failed</span>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
              <CheckCircle size={16} />
              <span>Connected Successfully!</span>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={status === 'validating'}>
            <Save size={16} className="mr-2" />
            Save Connection
          </Button>
        </div>
      </div>
    </div>
  );
};