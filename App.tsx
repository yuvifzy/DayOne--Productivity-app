import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { TaskService } from './services/taskService';
import { Task, TaskFilter } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Initialize tasks
  const [tasks, setTasks] = useState<Task[]>(() => TaskService.getTasks());
  const [loading, setLoading] = useState(false);
  
  // View state persistence
  const [view, setView] = useState<'dashboard' | 'tasks'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dayone_view');
      return (saved === 'dashboard' || saved === 'tasks') ? saved : 'dashboard';
    }
    return 'dashboard';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  
  // Confirmation state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Filter state
  const [filter, setFilter] = useState<TaskFilter>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dayone_filter');
        return saved ? JSON.parse(saved) : { status: 'all' };
      } catch {
        return { status: 'all' };
      }
    }
    return { status: 'all' };
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('dayone_view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('dayone_filter', JSON.stringify(filter));
  }, [filter]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const loadTasks = () => {
    setTasks(TaskService.getTasks());
  };

  const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    TaskService.createTask(task);
    loadTasks();
    setIsModalOpen(false);
  };

  const handleUpdateTask = (task: Task) => {
    // If it's an existing task being updated, we confirm
    setConfirmConfig({
      isOpen: true,
      title: 'Confirm Changes',
      message: 'Are you sure you want to save these changes to the task?',
      confirmLabel: 'Save Changes',
      variant: 'info',
      onConfirm: () => {
        TaskService.updateTask(task);
        loadTasks();
        setIsModalOpen(false);
        setEditingTask(undefined);
        setConfirmConfig(null);
      }
    });
  };

  const handleDeleteTask = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        // Optimistic update
        setTasks(prev => prev.filter(t => t.id !== id));
        // Persist
        TaskService.deleteTask(id);
        setConfirmConfig(null);
      }
    });
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleComplete = (task: Task) => {
    const updated = { ...task, isCompleted: !task.isCompleted };
    TaskService.updateTask(updated);
    loadTasks();
  };

  const handleOpenCreateModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleViewTasks = (filterOverride?: TaskFilter) => {
    if (filterOverride) {
      setFilter(filterOverride);
    } else {
      setFilter({ status: 'all' });
    }
    setView('tasks');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading DayOne...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      currentView={view}
      onNavigate={setView}
      onAddClick={handleOpenCreateModal}
      isDarkMode={darkMode}
      onToggleDarkMode={toggleDarkMode}
    >
      {view === 'dashboard' ? (
        <Dashboard 
          tasks={tasks} 
          onViewTasks={handleViewTasks} 
          isDarkMode={darkMode}
        />
      ) : (
        <TaskList
          tasks={tasks}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={handleEditClick}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          initialData={editingTask}
        />
      )}

      {confirmConfig && (
        <ConfirmationModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          variant={confirmConfig.variant}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </Layout>
  );
};

export default App;
