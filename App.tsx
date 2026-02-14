import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TodoItem } from './components/TodoItem';
import { GithubSettings } from './components/GithubSettings';
import { Button } from './components/Button';
import { Todo, FilterType, GithubConfig, Subtask } from './types';
import { Plus, Search, Terminal, CheckCircle2 } from 'lucide-react';
import { fetchGithubIssues, createGithubIssue } from './services/githubService';

const App: React.FC = () => {
  // State
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('taskflow_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [ghConfig, setGhConfig] = useState<GithubConfig | null>(() => {
    const saved = localStorage.getItem('taskflow_gh_config');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('taskflow_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (ghConfig) {
      localStorage.setItem('taskflow_gh_config', JSON.stringify(ghConfig));
    } else {
      localStorage.removeItem('taskflow_gh_config');
    }
  }, [ghConfig]);

  // Handlers
  const addTodo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskText.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: newTaskText,
      completed: false,
      createdAt: Date.now(),
      subtasks: [],
      tags: []
    };

    // If GitHub is connected, ask to create an issue? 
    // For simplicity, we just create locally, user can "Push" later if we implemented that.
    // Or we can auto-create if config exists. Let's auto-create if connected for "Sync" feel.
    let finalTodo = newTodo;
    
    if (ghConfig) {
       // Optional: Could prompt user, but let's just create it to demonstrate "Deployment/Connection"
       try {
         setIsSyncing(true);
         const issue = await createGithubIssue(newTodo, ghConfig);
         finalTodo = {
           ...newTodo,
           githubIssueNumber: issue.number,
           githubUrl: issue.html_url
         };
       } catch (err) {
         console.error("Failed to create GitHub issue", err);
         // Fallback to local only
       } finally {
         setIsSyncing(false);
       }
    }

    setTodos(prev => [finalTodo, ...prev]);
    setNewTaskText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const updateSubtasks = (id: string, subtasks: Subtask[]) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, subtasks } : t));
  };

  const handleSyncGithub = useCallback(async () => {
    if (!ghConfig) return;
    setIsSyncing(true);
    try {
      const issues = await fetchGithubIssues(ghConfig);
      
      setTodos(prev => {
        const existingIds = new Set(prev.filter(t => t.githubIssueNumber).map(t => t.githubIssueNumber));
        const newTodos: Todo[] = issues
          .filter(i => !existingIds.has(i.number))
          .map(i => ({
            id: crypto.randomUUID(),
            text: i.title,
            completed: i.state === 'closed',
            createdAt: Date.now(),
            subtasks: [], // Could parse body for checkboxes if we wanted to be fancy
            githubIssueNumber: i.number,
            githubUrl: i.html_url,
            tags: ['github']
          }));
        
        return [...newTodos, ...prev];
      });
    } catch (error) {
      console.error("Sync failed", error);
      alert("Failed to sync with GitHub. Please check your token permissions.");
    } finally {
      setIsSyncing(false);
    }
  }, [ghConfig]);

  // Derived State
  const filteredTodos = todos.filter(t => {
    if (filter === FilterType.ACTIVE) return !t.completed;
    if (filter === FilterType.COMPLETED) return t.completed;
    return true;
  }).filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        currentFilter={filter}
        onFilterChange={setFilter}
        onOpenGithubSettings={() => setIsSettingsOpen(true)}
        ghConfig={ghConfig}
        onSyncGithub={handleSyncGithub}
        isSyncing={isSyncing}
        totalTodos={todos.length}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {filter === FilterType.ALL ? 'All Tasks' : filter === FilterType.ACTIVE ? 'Active Tasks' : 'Completed Tasks'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              You have {stats.active} active tasks remaining.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                  type="text" 
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white border focus:border-brand-500 rounded-lg text-sm w-64 transition-all outline-none"
               />
             </div>
             {/* Deployment Hint */}
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-mono text-slate-500 border border-slate-200">
                <Terminal size={12} />
                <span>git push origin main</span>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Input Area */}
            <form onSubmit={addTodo} className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                <Plus size={24} />
              </div>
              <input 
                type="text" 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder={ghConfig ? "Add a task (syncs to GitHub automatically)..." : "Add a new task..."}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-sm border border-slate-200 focus:shadow-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-lg outline-none transition-all placeholder:text-slate-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button type="submit" disabled={!newTaskText.trim() || isSyncing} size="sm">
                  Add Task
                </Button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                    <CheckCircle2 size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-medium text-lg">No tasks found</h3>
                  <p className="text-slate-500 mt-2">Get started by creating a new task above.</p>
                </div>
              ) : (
                filteredTodos.map(todo => (
                  <TodoItem 
                    key={todo.id} 
                    todo={todo} 
                    onToggle={toggleTodo} 
                    onDelete={deleteTodo}
                    onUpdateSubtasks={updateSubtasks}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <GithubSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={ghConfig}
        onSave={setGhConfig}
      />
    </div>
  );
};

export default App;