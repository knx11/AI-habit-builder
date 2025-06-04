import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, SubTask, TimeBlock, DailyStats, PomodoroSettings } from '@/types/task';
import { generateUniqueId } from '@/utils/helpers';

interface TaskState {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  dailyStats: DailyStats[];
  pomodoroSettings: PomodoroSettings;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subTasks' | 'aiGenerated'>) => string;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string, completed: boolean) => void;
  
  // SubTask actions
  addSubTask: (taskId: string, subTask: Omit<SubTask, 'id' | 'completed'>) => void;
  updateSubTask: (taskId: string, subTaskId: string, updates: Partial<Omit<SubTask, 'id'>>) => void;
  completeSubTask: (taskId: string, subTaskId: string, completed: boolean) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  deleteAllSubTasks: (taskId: string) => void;
  
  // Time tracking
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'duration'>) => void;
  updateTaskTime: (taskId: string, estimatedMinutes: number) => void;
  
  // Stats
  addDailyStats: (stats: DailyStats) => void;
  
  // Pomodoro settings
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  
  // AI-generated tasks
  addAIGeneratedSubTasks: (taskId: string, subTasks: Omit<SubTask, 'id' | 'completed'>[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      timeBlocks: [],
      dailyStats: [],
      pomodoroSettings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
      },
      
      addTask: (taskData) => {
        const id = generateUniqueId();
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id,
              ...taskData,
              createdAt: new Date().toISOString(),
              completed: false,
              subTasks: [],
              aiGenerated: false,
            },
          ],
        }));
        return id;
      },
      
      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        }));
      },
      
      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },
      
      completeTask: (taskId, completed) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, completed } : task
          ),
        }));
      },
      
      addSubTask: (taskId, subTaskData) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [
                    ...task.subTasks,
                    {
                      id: generateUniqueId(),
                      ...subTaskData,
                      completed: false,
                    },
                  ],
                }
              : task
          ),
        }));
      },
      
      updateSubTask: (taskId, subTaskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.map((subTask) =>
                    subTask.id === subTaskId
                      ? { ...subTask, ...updates }
                      : subTask
                  ),
                }
              : task
          ),
        }));
      },
      
      completeSubTask: (taskId, subTaskId, completed) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.map((subTask) =>
                    subTask.id === subTaskId
                      ? { ...subTask, completed }
                      : subTask
                  ),
                }
              : task
          ),
        }));
      },
      
      deleteSubTask: (taskId, subTaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.filter(
                    (subTask) => subTask.id !== subTaskId
                  ),
                }
              : task
          ),
        }));
      },
      
      deleteAllSubTasks: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [],
                }
              : task
          ),
        }));
      },
      
      addTimeBlock: (timeBlockData) => {
        const startTime = new Date(timeBlockData.startTime);
        const endTime = new Date(timeBlockData.endTime);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        set((state) => ({
          timeBlocks: [
            ...state.timeBlocks,
            {
              ...timeBlockData,
              duration,
            },
          ],
        }));
      },
      
      updateTaskTime: (taskId, estimatedMinutes) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        
        if (!task) return;
        
        const originalEstimate = task.estimatedMinutes;
        const ratio = estimatedMinutes / originalEstimate;
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  estimatedMinutes,
                  subTasks: task.subTasks.map((subTask) => ({
                    ...subTask,
                    estimatedMinutes: Math.round(subTask.estimatedMinutes * ratio),
                  })),
                }
              : task
          ),
        }));
      },
      
      addDailyStats: (stats) => {
        set((state) => ({
          dailyStats: [...state.dailyStats, stats],
        }));
      },
      
      updatePomodoroSettings: (settings) => {
        set((state) => ({
          pomodoroSettings: {
            ...state.pomodoroSettings,
            ...settings,
          },
        }));
      },
      
      addAIGeneratedSubTasks: (taskId, subTasksData) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  aiGenerated: true,
                  subTasks: [
                    ...task.subTasks,
                    ...subTasksData.map((subTaskData) => ({
                      id: generateUniqueId(),
                      ...subTaskData,
                      completed: false,
                    })),
                  ],
                }
              : task
          ),
        }));
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);