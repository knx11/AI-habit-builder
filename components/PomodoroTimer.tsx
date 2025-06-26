import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Modal, Dimensions } from 'react-native';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import * as Haptics from 'expo-haptics';

interface PomodoroTimerProps {
  taskId?: string;
}

type TimerState = 'work' | 'shortBreak' | 'longBreak';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { pomodoroSettings } = useTaskStore();
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Simplified time picker state
  const [selectedMinutes, setSelectedMinutes] = useState(Math.floor(timeLeft / 60));
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getDuration = useCallback(() => {
    switch (timerState) {
      case 'work':
        return pomodoroSettings.workDuration * 60;
      case 'shortBreak':
        return pomodoroSettings.shortBreakDuration * 60;
      case 'longBreak':
        return pomodoroSettings.longBreakDuration * 60;
    }
  }, [pomodoroSettings, timerState]);

  useEffect(() => {
    setTimeLeft(getDuration());
    setProgress(0);
  }, [timerState, getDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          const newTime = prev - 1;
          const duration = getDuration();
          setProgress(((duration - newTime) / duration) * 100);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, getDuration]);

  const handleTimerComplete = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
    
    setIsRunning(false);
    
    if (timerState === 'work') {
      if (currentSession % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setTimerState('longBreak');
      } else {
        setTimerState('shortBreak');
      }
    } else {
      setTimerState('work');
      if (timerState === 'longBreak') {
        setCurrentSession(1);
      } else {
        setCurrentSession((prev) => prev + 1);
      }
    }
  };

  const toggleTimer = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
    setIsRunning(false);
    const duration = getDuration();
    setTimeLeft(duration);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = (state: TimerState) => {
    switch (state) {
      case 'work':
        return colors.primary;
      case 'shortBreak':
        return colors.secondary;
      case 'longBreak':
        return colors.accent;
    }
  };
  
  const openTimePicker = () => {
    if (isRunning) return;
    
    setSelectedMinutes(Math.floor(timeLeft / 60));
    setShowTimePicker(true);
  };
  
  const applyTimeSelection = () => {
    const newTimeInSeconds = selectedMinutes * 60;
    setTimeLeft(newTimeInSeconds);
    setProgress(0);
    setShowTimePicker(false);
    
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
  };

  const adjustMinutes = (amount: number) => {
    setSelectedMinutes(Math.max(1, Math.min(120, selectedMinutes + amount)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerStatesContainer}>
        <TouchableOpacity
          style={[
            styles.stateButton,
            timerState === 'work' && { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            if (!isRunning) {
              setTimerState('work');
              resetTimer();
            }
          }}
        >
          <Text
            style={[
              styles.stateText,
              timerState === 'work' && styles.activeStateText,
            ]}
          >
            Work
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stateButton,
            timerState === 'shortBreak' && { backgroundColor: colors.secondary },
          ]}
          onPress={() => {
            if (!isRunning) {
              setTimerState('shortBreak');
              resetTimer();
            }
          }}
        >
          <Text
            style={[
              styles.stateText,
              timerState === 'shortBreak' && styles.activeStateText,
            ]}
          >
            Short Break
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stateButton,
            timerState === 'longBreak' && { backgroundColor: colors.accent },
          ]}
          onPress={() => {
            if (!isRunning) {
              setTimerState('longBreak');
              resetTimer();
            }
          }}
        >
          <Text
            style={[
              styles.stateText,
              timerState === 'longBreak' && styles.activeStateText,
            ]}
          >
            Long Break
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <TouchableOpacity
          onPress={isRunning ? toggleTimer : openTimePicker}
          activeOpacity={0.8}
          style={[styles.timerCircle, { borderColor: getStateColor(timerState) }]}
        >
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.sessionText}>Session {currentSession}</Text>
            <Text style={styles.tapHint}>
              {isRunning ? 'Tap to pause' : 'Tap to adjust time'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={resetTimer} style={styles.controlButton}>
          <RotateCcw size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleTimer} style={[styles.playButton, { backgroundColor: getStateColor(timerState) }]}>
          {isRunning ? (
            <Pause size={32} color={colors.background} />
          ) : (
            <Play size={32} color={colors.background} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!isRunning) {
              setTimerState(timerState === 'work' ? 'shortBreak' : 'work');
              resetTimer();
            }
          }}
          style={styles.controlButton}
        >
          <Coffee size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Simplified Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Set Timer Duration</Text>
            
            <View style={styles.timePickerContent}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => adjustMinutes(-5)}
              >
                <Text style={styles.timeButtonText}>-5</Text>
              </TouchableOpacity>
              
              <View style={styles.timeDisplay}>
                <Text style={styles.timeValue}>{selectedMinutes}</Text>
                <Text style={styles.timeUnit}>minutes</Text>
              </View>
              
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => adjustMinutes(5)}
              >
                <Text style={styles.timeButtonText}>+5</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickTimeButtons}>
              {[15, 25, 30, 45, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.quickTimeButton,
                    selectedMinutes === minutes && styles.selectedQuickTime
                  ]}
                  onPress={() => setSelectedMinutes(minutes)}
                >
                  <Text style={[
                    styles.quickTimeText,
                    selectedMinutes === minutes && styles.selectedQuickTimeText
                  ]}>
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.pickerButton, styles.pickerConfirmButton]}
                onPress={applyTimeSelection}
              >
                <Text style={styles.pickerConfirmText}>Set Timer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerStatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  stateButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  activeStateText: {
    color: colors.background,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: colors.primary,
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  // Simplified Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  timeDisplay: {
    alignItems: 'center',
    marginHorizontal: 30,
  },
  timeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timeUnit: {
    fontSize: 16,
    color: colors.textLight,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quickTimeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    margin: 4,
  },
  selectedQuickTime: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickTimeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedQuickTimeText: {
    color: colors.background,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  pickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  pickerConfirmButton: {
    backgroundColor: colors.primary,
  },
  pickerCancelText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  pickerConfirmText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
    textAlign: 'center',
  },
});