import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { SubTask } from '@/types/task';

type PomodoroStage = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSession {
  subTask: SubTask;
  duration: number; // in seconds
  completed: boolean;
}

interface PomodoroTimerProps {
  taskId: string;
}

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { tasks, pomodoroSettings, updateSubTask } = useTaskStore();
  
  const task = tasks.find(t => t.id === taskId);
  
  // Create sessions for each subtask
  const sessions: PomodoroSession[] = useMemo(() => {
    const incompletedSubTasks = task?.subTasks.filter(st => !st.completed) || [];
    return incompletedSubTasks.map(subTask => ({
      subTask,
      duration: subTask.estimatedMinutes * 60,
      completed: false
    }));
  }, [task?.subTasks]);
  
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<PomodoroStage>('work');
  const [timeLeft, setTimeLeft] = useState(() => {
    if (sessions.length > 0) {
      return sessions[0].duration;
    }
    return pomodoroSettings.workDuration * 60;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState('');

  const handleStageComplete = React.useCallback(() => {
    if (currentStage === 'work') {
      // Mark current subtask as completed
      const currentSession = sessions[currentSessionIndex];
      if (currentSession && task) {
        updateSubTask(task.id, currentSession.subTask.id, {
          completed: true,
          actualMinutes: Math.ceil((currentSession.duration - timeLeft) / 60)
        });
      }
      
      setCompletedSessions(prev => prev + 1);
      
      // Determine break type
      const shouldTakeLongBreak = (completedSessions + 1) % pomodoroSettings.sessionsBeforeLongBreak === 0;
      const nextStage: PomodoroStage = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
      const breakDuration = shouldTakeLongBreak 
        ? pomodoroSettings.longBreakDuration * 60 
        : pomodoroSettings.shortBreakDuration * 60;
      
      setCurrentStage(nextStage);
      setTimeLeft(breakDuration);
      setIsRunning(true); // Auto-start break timer
    } else {
      // Break finished, move to next work session
      const nextSessionIndex = currentSessionIndex + 1;
      
      if (nextSessionIndex < sessions.length) {
        setCurrentSessionIndex(nextSessionIndex);
        setCurrentStage('work');
        setTimeLeft(sessions[nextSessionIndex].duration);
      } else {
        // All sessions completed
        setIsRunning(false);
        setCurrentStage('work');
        setCurrentSessionIndex(0);
        if (sessions.length > 0) {
          setTimeLeft(sessions[0].duration);
        }
      }
    }
  }, [currentStage, sessions, currentSessionIndex, task, updateSubTask, timeLeft, completedSessions, pomodoroSettings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          setTotalTimeSpent(total => total + 1);
          return newTime;
        });
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer finished, move to next stage
      handleStageComplete();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, handleStageComplete]);



  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setCurrentSessionIndex(0);
    setCurrentStage('work');
    setIsRunning(false);
    setCompletedSessions(0);
    setTotalTimeSpent(0);
    if (sessions.length > 0) {
      setTimeLeft(sessions[0].duration);
    } else {
      setTimeLeft(pomodoroSettings.workDuration * 60);
    }
  };

  const markCurrentSubtaskDone = () => {
    if (currentStage === 'work') {
      const currentSession = sessions[currentSessionIndex];
      if (currentSession && task) {
        // Mark current subtask as completed
        updateSubTask(task.id, currentSession.subTask.id, {
          completed: true,
          actualMinutes: Math.ceil((currentSession.duration - timeLeft) / 60)
        });
        
        // Move to next session or break and auto-start break
        setIsRunning(false); // Stop current timer first
        handleStageComplete();
      }
    } else {
      // Skip break
      handleStageComplete();
    }
  };

  const handleTimeEdit = () => {
    const currentMinutes = Math.ceil(timeLeft / 60);
    setEditTimeValue(currentMinutes.toString());
    setIsEditingTime(true);
  };

  const saveTimeEdit = () => {
    const newMinutes = parseInt(editTimeValue);
    if (isNaN(newMinutes) || newMinutes <= 0) {
      Alert.alert('Invalid Time', 'Please enter a valid number of minutes.');
      return;
    }
    
    const newTimeInSeconds = newMinutes * 60;
    setTimeLeft(newTimeInSeconds);
    setIsEditingTime(false);
    setEditTimeValue('');
  };

  const cancelTimeEdit = () => {
    setIsEditingTime(false);
    setEditTimeValue('');
  };

  const goToPreviousSession = () => {
    if (currentSessionIndex > 0) {
      const prevSessionIndex = currentSessionIndex - 1;
      setCurrentSessionIndex(prevSessionIndex);
      setCurrentStage('work');
      setTimeLeft(sessions[prevSessionIndex].duration);
      setIsRunning(false);
    }
  };

  const goToNextSession = () => {
    if (currentSessionIndex < sessions.length - 1) {
      const nextSessionIndex = currentSessionIndex + 1;
      setCurrentSessionIndex(nextSessionIndex);
      setCurrentStage('work');
      setTimeLeft(sessions[nextSessionIndex].duration);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStageText = () => {
    switch (currentStage) {
      case 'work':
        const currentSession = sessions[currentSessionIndex];
        return currentSession ? `Working on: ${currentSession.subTask.title}` : 'Work Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Work Time';
    }
  };

  const getStageColor = () => {
    switch (currentStage) {
      case 'work':
        return colors.primary;
      case 'shortBreak':
        return colors.success;
      case 'longBreak':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  if (!task || sessions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No subtasks available</Text>
          <Text style={styles.emptySubtext}>Add subtasks to start a Pomodoro session</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Session Progress</Text>
          <Text style={styles.progressText}>
            {currentSessionIndex + 1} of {sessions.length} subtasks
          </Text>
          <Text style={styles.timeSpentText}>
            Total time: {formatTime(totalTimeSpent)}
          </Text>
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentSessionIndex === 0 && styles.navButtonDisabled
            ]} 
            onPress={goToPreviousSession}
            disabled={currentSessionIndex === 0}
          >
            <ChevronLeft 
              size={24} 
              color={currentSessionIndex === 0 ? colors.textLight : colors.text} 
            />
          </TouchableOpacity>

          {/* Timer Circle */}
          <View style={[styles.timerCircle, { borderColor: getStageColor() }]}>
            {isEditingTime ? (
              <View style={styles.editTimeContainer}>
                <TextInput
                  style={styles.timeInput}
                  value={editTimeValue}
                  onChangeText={setEditTimeValue}
                  keyboardType="numeric"
                  placeholder="Minutes"
                  placeholderTextColor={colors.textLight}
                  autoFocus
                />
                <View style={styles.editTimeButtons}>
                  <TouchableOpacity style={styles.editTimeButton} onPress={saveTimeEdit}>
                    <Text style={styles.editTimeButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.editTimeButton, styles.cancelButton]} onPress={cancelTimeEdit}>
                    <Text style={styles.editTimeButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <TouchableOpacity onPress={handleTimeEdit} style={styles.timeContainer}>
                  <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                  <Edit3 size={16} color={colors.textLight} style={styles.editIcon} />
                </TouchableOpacity>
                <Text style={[styles.phaseText, { color: getStageColor() }]}>
                  {getStageText()}
                </Text>
                {currentStage === 'work' && (
                  <Text style={styles.estimatedText}>
                    Est: {sessions[currentSessionIndex]?.subTask.estimatedMinutes}min
                  </Text>
                )}
              </>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentSessionIndex === sessions.length - 1 && styles.navButtonDisabled
            ]} 
            onPress={goToNextSession}
            disabled={currentSessionIndex === sessions.length - 1}
          >
            <ChevronRight 
              size={24} 
              color={currentSessionIndex === sessions.length - 1 ? colors.textLight : colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: getStageColor() }]} 
            onPress={toggleTimer}
          >
            <Text style={styles.buttonText}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.doneButton]} 
            onPress={markCurrentSubtaskDone}
          >
            <Text style={styles.buttonText}>
              {currentStage === 'work' ? 'Done' : 'Skip Break'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.resetButton]} 
            onPress={resetTimer}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 2,
  },
  timeSpentText: {
    fontSize: 14,
    color: colors.textLight,
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.primary,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  phaseText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  estimatedText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  doneButton: {
    backgroundColor: colors.success,
  },
  resetButton: {
    backgroundColor: colors.textLight,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    marginTop: 4,
    opacity: 0.6,
  },
  editTimeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  timeInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
    marginBottom: 20,
  },
  editTimeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editTimeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: colors.textLight,
  },
  editTimeButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});