import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { TaskService } from './services/taskService';
import { Task, TaskFilter } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'tasks'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<TaskFilter>({ status: 'all' });
  
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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setLoading(true);
    // Simulate network delay for "backend"
    setTimeout(() => {
      setTasks(TaskService.getTasks());
      setLoading(false);
    }, 600);
  };

  const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    TaskService.createTask(task);
    loadTasks();
    setIsModalOpen(false);
  };

  const handleUpdateTask = (task: Task) => {
    TaskService.updateTask(task);
    loadTasks();
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      TaskService.deleteTask(id);
      loadTasks();
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleToggleComplete = (task: Task) => {
    TaskService.updateTask({ ...task, isCompleted: !task.isCompleted });
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
    </Layout>
  );
};

export default App;