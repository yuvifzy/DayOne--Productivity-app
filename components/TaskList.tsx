import React, { useState } from 'react';
import { Task, TaskFilter, Priority, Category, PRIORITY_COLORS, CATEGORY_COLORS } from '../types';
import { Search, Filter, Calendar, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  filter,
  onFilterChange,
  onEdit,
  onDelete,
  onToggleComplete,
  onUpdateTask,
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  /**
   * Safely formats a date string to avoid RangeError: Invalid time value.
   */
  const safeFormatDate = (dateStr: string, formatStr: string): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatStr);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter.status === 'completed' && !task.isCompleted) return false;
    if (filter.status === 'pending' && task.isCompleted) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.category && task.category !== filter.category) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filter.search || ''}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select
            value={filter.status}
            onChange={(e) => onFilterChange({ ...filter, status: e.target.value as any })}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filter.priority || ''}
            onChange={(e) => onFilterChange({ ...filter, priority: e.target.value as Priority || undefined })}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="">All Priorities</option>
            {Object.values(Priority).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

           <select
            value={filter.category || ''}
            onChange={(e) => onFilterChange({ ...filter, category: e.target.value as Category || undefined })}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {Object.values(Category).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or create a new task.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const completedSubtasks = task.subtasks?.filter(t => t.isCompleted).length || 0;
            const totalSubtasks = task.subtasks?.length || 0;
            const isExpanded = expandedTasks[task.id];

            return (
              <div
                key={task.id}
                className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  task.isCompleted ? 'opacity-75 bg-gray-50 dark:bg-gray-800/50' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => onToggleComplete(task)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          task.isCompleted
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      
                      <div>
                        <h3 className={`text-lg font-semibold text-gray-900 dark:text-white transition-all ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        <p className={`mt-1 text-gray-600 dark:text-gray-400 text-sm line-clamp-2 ${task.isCompleted ? 'line-through text-gray-400 dark:text-gray-600' : ''}`}>
                          {task.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[task.category]}`}>
                            {task.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {safeFormatDate(task.startDate, 'MMM d')} - {safeFormatDate(task.endDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                          {totalSubtasks > 0 && (
                            <button 
                              onClick={() => toggleExpand(task.id)}
                              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                            >
                              {completedSubtasks}/{totalSubtasks} subtasks
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(task)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Subtasks */}
                {isExpanded && totalSubtasks > 0 && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="mt-4 space-y-2 pl-10">
                      {task.subtasks.map((st) => (
                        <div 
                          key={st.id} 
                          className="flex items-center gap-3 cursor-pointer group/subtask"
                          onClick={() => handleToggleSubtask(task, st.id)}
                        >
                          {st.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover/subtask:text-indigo-400" />
                          )}
                          <span className={`text-sm ${st.isCompleted ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};