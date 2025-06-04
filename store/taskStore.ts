import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, SubTask, TimeBlock, DailyStats, PomodoroSettings } from '@/types/task';
import { generateUniqueId } from '@/utils/helpers';

interface TaskStore {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  dailyStats: DailyStats[];
  pomodoroSettings: PomodoroSettings;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subTasks' | 'aiGenerated'>) => string;
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
}

const defaultPomodoroSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      timeBlocks: [],
      dailyStats: [],
      pomodoroSettings: defaultPomodoroSettings,
      
      addTask: (task) => {
        const id = generateUniqueId();
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
    }),
    {
      name: 'task-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);