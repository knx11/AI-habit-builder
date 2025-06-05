import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, SubTask, TimeBlock, DailyStats, PomodoroSettings, TaskPriority } from '@/types/task';
import { generateUniqueId } from '@/utils/helpers';

interface TaskStore {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  dailyStats: DailyStats[];
  pomodoroSettings: PomodoroSettings;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subTasks' | 'aiGenerated' | 'order'>) => string;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  completeTask: (taskId: string, completed: boolean) => void;
  
  addSubTask: (taskId: string, subTask: Pick<SubTask, 'title' | 'estimatedMinutes'>) => void;
  updateSubTask: (taskId: string, subTaskId: string, updates: Partial<SubTask>) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  deleteAllSubTasks: (taskId: string) => void;
  completeSubTask: (taskId: string, subTaskId: string, completed: boolean) => void;
  
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  addDailyStats: (stats: DailyStats) => void;
  updatePomodoroSettings: (settings: PomodoroSettings) => void;
  addAIGeneratedSubTasks: (taskId: string, subTasks: Array<{ title: string; estimatedMinutes: number }>) => void;
  
  // New functions for task ordering and priority
  reorderTasks: (taskIds: string[]) => void;
  assignPriority: (taskId: string, priority: TaskPriority) => void;
  autoAssignPriorities: () => void;
}

const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      timeBlocks: [],
      dailyStats: [],
      pomodoroSettings: defaultPomodoroSettings,
      
      addTask: (task) => {
        const id = generateUniqueId();
        const tasks = get().tasks;
        const maxOrder = tasks.length > 0 
          ? Math.max(...tasks.map(t => t.order || 0)) 
          : 0;
          
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id,
              createdAt: new Date().toISOString(),
              completed: false,
              subTasks: [],
              aiGenerated: false,
              order: maxOrder + 1,
            },
          ],
        }));
        
        // Auto-assign priority to the new task
        setTimeout(() => {
          get().autoAssignPriorities();
        }, 100);
        
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
            task.id === taskId
              ? {
                  ...task,
                  completed,
                  subTasks: task.subTasks.map((subTask) => ({
                    ...subTask,
                    completed,
                  })),
                }
              : task
          ),
        }));
      },
      
      addSubTask: (taskId, subTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [
                    ...task.subTasks,
                    {
                      id: generateUniqueId(),
                      ...subTask,
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
                  completed:
                    completed &&
                    task.subTasks
                      .filter((st) => st.id !== subTaskId)
                      .every((st) => st.completed),
                }
              : task
          ),
        }));
      },
      
      addTimeBlock: (timeBlock) => {
        set((state) => ({
          timeBlocks: [...state.timeBlocks, { ...timeBlock }],
        }));
      },
      
      addDailyStats: (stats) => {
        set((state) => ({
          dailyStats: [...state.dailyStats, stats],
        }));
      },
      
      updatePomodoroSettings: (settings) => {
        set(() => ({
          pomodoroSettings: settings,
        }));
      },
      
      addAIGeneratedSubTasks: (taskId, subTasks) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [
                    ...task.subTasks,
                    ...subTasks.map((st) => ({
                      id: generateUniqueId(),
                      title: st.title,
                      estimatedMinutes: st.estimatedMinutes,
                      completed: false,
                    })),
                  ],
                  aiGenerated: true,
                }
              : task
          ),
        }));
      },
      
      // New function to reorder tasks
      reorderTasks: (taskIds) => {
        set((state) => {
          const updatedTasks = [...state.tasks];
          
          // Update order property for each task based on new order
          taskIds.forEach((id, index) => {
            const taskIndex = updatedTasks.findIndex(task => task.id === id);
            if (taskIndex !== -1) {
              updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                order: index + 1
              };
            }
          });
          
          return { tasks: updatedTasks };
        });
      },
      
      // Assign priority to a task
      assignPriority: (taskId, priority) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, priority }
              : task
          ),
        }));
      },
      
      // Auto-assign priorities based on task properties
      autoAssignPriorities: () => {
        set((state) => {
          const updatedTasks = state.tasks.map(task => {
            // Skip already completed tasks
            if (task.completed) {
              return { ...task, priority: 'low' as TaskPriority };
            }
            
            // Analyze task to determine priority
            let score = 0;
            
            // Check if task has a due date
            if (task.dueDate) {
              const dueDate = new Date(task.dueDate);
              const now = new Date();
              const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              // Higher score for tasks due soon
              if (daysUntilDue <= 1) score += 5;
              else if (daysUntilDue <= 3) score += 3;
              else if (daysUntilDue <= 7) score += 1;
            }
            
            // Check estimated time (longer tasks might be more important)
            if (task.estimatedMinutes > 120) score += 2;
            else if (task.estimatedMinutes > 60) score += 1;
            
            // Check if task has subtasks (more complex tasks might be more important)
            if (task.subTasks.length > 3) score += 2;
            else if (task.subTasks.length > 0) score += 1;
            
            // Check category (work tasks might be more important)
            if (task.category === 'Work') score += 2;
            
            // Assign priority based on score
            let priority: TaskPriority;
            if (score >= 5) priority = 'high';
            else if (score >= 3) priority = 'medium';
            else if (score >= 1) priority = 'low';
            else priority = 'optional';
            
            return { ...task, priority };
          });
          
          return { tasks: updatedTasks };
        });
      }
    }),
    {
      name: 'task-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);