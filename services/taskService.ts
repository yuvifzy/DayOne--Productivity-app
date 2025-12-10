import { Task, Priority, Category } from '../types';

const STORAGE_KEY = 'dayone_tasks_v1';

// Seed data if empty
const seedTasks: Task[] = [
  {
    id: '1',
    title: 'Design System Architecture',
    description: 'Create the initial UML diagrams for the Java backend service.',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: Priority.HIGH,
    category: Category.WORK,
    isCompleted: false,
    subtasks: [
      { id: 'st1', title: 'Define Database Schema', isCompleted: true },
      { id: 'st2', title: 'Setup Spring Boot', isCompleted: false },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Weekly Grocery Run',
    description: 'Buy vegetables, fruits, and chicken for the week.',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    priority: Priority.MEDIUM,
    category: Category.PERSONAL,
    isCompleted: false,
    subtasks: [],
    createdAt: Date.now() - 10000,
    updatedAt: Date.now(),
  },
  {
    id: '3',
    title: 'Learn Gemini API',
    description: 'Study the documentation for the new Gemini 2.5 Flash model.',
    startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    priority: Priority.URGENT,
    category: Category.LEARNING,
    isCompleted: false,
    subtasks: [],
    createdAt: Date.now() - 20000,
    updatedAt: Date.now(),
  }
];

export const TaskService = {
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));
      return seedTasks;
    }
    return JSON.parse(data);
  },

  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const tasks = TaskService.getTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return newTask;
  },

  updateTask: (updatedTask: Task): Task => {
    const tasks = TaskService.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = { ...updatedTask, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
    return updatedTask;
  },

  deleteTask: (id: string): void => {
    const tasks = TaskService.getTasks().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
};