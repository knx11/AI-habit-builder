import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface PomodoroTimerProps {
  taskId?: string;
  subTaskId?: string;
  onComplete?: () => void;
}

type TimerState = 'work' | 'shortBreak' | 'longBreak';

export default function PomodoroTimer({ taskId, subTaskId, onComplete }: PomodoroTimerProps) {
  const { pomodoroSettings } = useTaskStore();
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);
  
  // Get the current timer duration based on state
  const getCurrentDuration = () => {
    switch (timerState) {
      case 'work':
        return pomodoroSettings.workDuration * 60;
      case 'shortBreak':
        return pomodoroSettings.shortBreakDuration * 60;
      case 'longBreak':
        return pomodoroSettings.longBreakDuration * 60;
    }
  };
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isActive]);
  
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (isActive) {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background
        backgroundTimeRef.current = Date.now();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App is coming to foreground
        if (backgroundTimeRef.current) {
          const backgroundTime = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
          setTimeLeft((prev) => Math.max(0, prev - backgroundTime));
          backgroundTimeRef.current = null;
        }
      }
    }
    
    appState.current = nextAppState;
  };
  
  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);
  
  // Reset timer when timer state changes
  useEffect(() => {
    setTimeLeft(getCurrentDuration());
  }, [timerState, pomodoroSettings]);
  
  const handleTimerComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (timerState === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      if (newSessions % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setTimerState('longBreak');
      } else {
        setTimerState('shortBreak');
      }
      
      if (onComplete) {
        onComplete();
      }
    } else {
      setTimerState('work');
    }
    
    setIsActive(false);
  };
  
  const toggleTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsActive(false);
    setTimeLeft(getCurrentDuration());
  };
  
  // Calculate progress percentage
  const progress = (timeLeft / getCurrentDuration()) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.timerStates}>
        <TouchableOpacity
          style={[styles.stateButton, timerState === 'work' && styles.activeState]}
          onPress={() => {
            setIsActive(false);
            setTimerState('work');
          }}
        >
          <Text style={[styles.stateText, timerState === 'work' && styles.activeStateText]}>
            Work
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.stateButton, timerState === 'shortBreak' && styles.activeState]}
          onPress={() => {
            setIsActive(false);
            setTimerState('shortBreak');
          }}
        >
          <Text style={[styles.stateText, timerState === 'shortBreak' && styles.activeStateText]}>
            Short Break
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.stateButton, timerState === 'longBreak' && styles.activeState]}
          onPress={() => {
            setIsActive(false);
            setTimerState('longBreak');
          }}
        >
          <Text style={[styles.stateText, timerState === 'longBreak' && styles.activeStateText]}>
            Long Break
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <View 
            style={[
              styles.timerProgress, 
              { 
                transform: [{ rotate: `${(100 - progress) * 3.6}deg` }],
                opacity: progress / 100,
              }
            ]} 
          />
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.sessionText}>
              {timerState === 'work' ? `Session ${sessions + 1}` : 'Break Time'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
          <RotateCcw size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.playButton} onPress={toggleTimer}>
          {isActive ? (
            <Pause size={32} color={colors.background} />
          ) : (
            <Play size={32} color={colors.background} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => {
            setIsActive(false);
            setTimerState(timerState === 'work' ? 'shortBreak' : 'work');
          }}
        >
          {timerState === 'work' ? (
            <Coffee size={24} color={colors.text} />
          ) : (
            <Play size={24} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
  },
  timerStates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeState: {
    backgroundColor: colors.primary,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeStateText: {
    color: colors.background,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  timerProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  timerInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
  },
  sessionText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});