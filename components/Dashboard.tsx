import React from 'react';
import { Task, Priority, TaskFilter } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  onViewTasks: (filter?: TaskFilter) => void;
  isDarkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, onViewTasks, isDarkMode }) => {
  const completed = tasks.filter(t => t.isCompleted).length;
  const pending = tasks.length - completed;
  const urgent = tasks.filter(t => t.priority === Priority.URGENT && !t.isCompleted).length;
  
  // Calculate completion rate
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  // Data for Priority Chart
  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === Priority.LOW).length, color: '#93c5fd' },
    { name: 'Medium', value: tasks.filter(t => t.priority === Priority.MEDIUM).length, color: '#fde047' },
    { name: 'High', value: tasks.filter(t => t.priority === Priority.HIGH).length, color: '#fb923c' },
    { name: 'Urgent', value: tasks.filter(t => t.priority === Priority.URGENT).length, color: '#f87171' },
  ].filter(d => d.value > 0);

  // Data for Category Chart (Top 5)
  const categoryCount = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const chartTextColor = isDarkMode ? '#9ca3af' : '#6b7280';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
    color: isDarkMode ? '#f3f4f6' : '#111827'
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div 
          onClick={() => onViewTasks({ status: 'completed' })}
          className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 md:gap-4 transition-all cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed Tasks</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{completed}</p>
          </div>
        </div>

        <div 
          onClick={() => onViewTasks({ status: 'pending' })}
          className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 md:gap-4 transition-all cursor-pointer hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <Circle className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Tasks</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{pending}</p>
          </div>
        </div>

        <div 
          onClick={() => onViewTasks({ status: 'pending', priority: Priority.URGENT })}
          className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 md:gap-4 transition-all cursor-pointer hover:shadow-md hover:border-red-300 dark:hover:border-red-700 group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Urgent Pending</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{urgent}</p>
          </div>
        </div>

        <div 
          onClick={() => onViewTasks({ status: 'all' })}
          className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 md:gap-4 transition-all cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-700 group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <Clock className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completion Rate</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Tasks by Priority</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {priorityData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Tasks by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTextColor }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTextColor }} />
                <Tooltip cursor={{ fill: isDarkMode ? '#374151' : '#f3f4f6' }} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Quick Actions / Recent */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
         <div className="relative z-10 max-w-2xl">
           <h2 className="text-2xl font-bold mb-2">Ready to conquer the day?</h2>
           <p className="text-indigo-100 mb-6">You have {pending} pending tasks. Tackle the Urgent ones first to keep your momentum high.</p>
           <button 
             onClick={() => onViewTasks({ status: 'all' })}
             className="bg-white text-indigo-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-sm"
           >
             View All Tasks
           </button>
         </div>
         {/* Decorative circles */}
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl" />
         <div className="absolute bottom-0 right-20 -mb-10 w-40 h-40 bg-purple-500 opacity-10 rounded-full blur-2xl" />
      </div>
    </div>
  );
};