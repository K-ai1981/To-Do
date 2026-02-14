import React, { useState } from 'react';
import { Check, Trash2, Wand2, ChevronDown, ChevronUp, ExternalLink, GitPullRequest } from 'lucide-react';
import { Todo, Subtask } from '../types';
import { generateSubtasks } from '../services/geminiService';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSubtasks: (id: string, subtasks: Subtask[]) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdateSubtasks }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSubtasks = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    // Expand to show the loading or results
    setIsExpanded(true);
    
    const suggestions = await generateSubtasks(todo.text);
    
    const newSubtasks: Subtask[] = suggestions.map(text => ({
      id: crypto.randomUUID(),
      text,
      completed: false
    }));
    
    // Merge with existing
    onUpdateSubtasks(todo.id, [...todo.subtasks, ...newSubtasks]);
    setIsGenerating(false);
  };

  const toggleSubtask = (subtaskId: string) => {
    const updated = todo.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdateSubtasks(todo.id, updated);
  };

  const completedSubtasks = todo.subtasks.filter(s => s.completed).length;
  const progress = todo.subtasks.length > 0 
    ? Math.round((completedSubtasks / todo.subtasks.length) * 100) 
    : 0;

  return (
    <div className={`group relative bg-white rounded-xl border transition-all duration-200 ${
      todo.completed ? 'border-slate-100 bg-slate-50/50' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200'
    }`}>
      {/* Main Task Row */}
      <div className="flex items-center p-4 gap-4">
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.completed ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 text-transparent hover:border-brand-400'
          }`}
        >
          <Check size={14} strokeWidth={3} />
        </button>

        <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2 cursor-pointer">
            <h3 className={`font-medium truncate transition-all ${
              todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}>
              {todo.text}
            </h3>
            {todo.githubIssueNumber && (
              <a 
                href={todo.githubUrl} 
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <GitPullRequest size={10} className="mr-1" />
                #{todo.githubIssueNumber}
              </a>
            )}
          </div>
          {todo.subtasks.length > 0 && (
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
               <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-400 transition-all duration-500" style={{ width: `${progress}%` }} />
               </div>
               <span>{completedSubtasks}/{todo.subtasks.length} subtasks</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!todo.completed && (
            <button
              onClick={handleGenerateSubtasks}
              disabled={isGenerating}
              className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors tooltip-trigger"
              title="Auto-generate subtasks with AI"
            >
              <Wand2 size={18} className={isGenerating ? "animate-pulse" : ""} />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Expanded Subtasks Area */}
      {isExpanded && (
        <div className="px-14 pb-4 animate-in slide-in-from-top-2 duration-200">
           {todo.subtasks.length === 0 && !isGenerating && (
             <p className="text-sm text-slate-400 italic mb-2">No subtasks yet.</p>
           )}
           
           <div className="space-y-2">
             {todo.subtasks.map(subtask => (
               <div key={subtask.id} className="flex items-center gap-3 text-sm group/sub">
                 <button
                    onClick={() => toggleSubtask(subtask.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      subtask.completed ? 'bg-brand-400 border-brand-400 text-white' : 'border-slate-300 hover:border-brand-300'
                    }`}
                 >
                   {subtask.completed && <Check size={10} />}
                 </button>
                 <span className={`${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                   {subtask.text}
                 </span>
               </div>
             ))}
             
             {isGenerating && (
               <div className="flex items-center gap-2 text-sm text-brand-500 animate-pulse">
                 <Wand2 size={14} />
                 <span>AI is thinking...</span>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};