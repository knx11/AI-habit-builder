import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Play, Pause, RotateCcw, Coffee, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import * as Haptics from 'expo-haptics';

interface PomodoroTimerProps {
  taskId?: string;
}

type TimerState = 'work' | 'shortBreak' | 'longBreak';

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { pomodoroSettings } = useTaskStore();
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(25);

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
  }, [timerState, getDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });

        setProgress((prev) => {
          const duration = getDuration();
          return ((duration - (timeLeft - 1)) / duration) * 100;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsRunning(false);
    setTimeLeft(getDuration());
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  const handleAdjustTime = () => {
    const totalSeconds = (selectedHours * 60 * 60) + (selectedMinutes * 60);
    setTimeLeft(totalSeconds);
    setShowAdjustModal(false);
    setIsRunning(false);
    setProgress(0);
  };

  const generateNumbers = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
            setTimerState('work');
            resetTimer();
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
            setTimerState('shortBreak');
            resetTimer();
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
            setTimerState('longBreak');
            resetTimer();
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
          onPress={() => setShowAdjustModal(true)}
          activeOpacity={0.8}
          style={styles.timerCircle}
        >
          <View
            style={[
              styles.progressCircle,
              {
                width: 240,
                height: 240,
                borderRadius: 120,
                borderColor: getStateColor(timerState),
              },
            ]}
          />
          {progress > 0 && (
            <View
              style={[
                styles.progressArc,
                {
                  width: 240,
                  height: 240,
                  borderRadius: 120,
                  transform: [{ rotate: `${progress * 3.6}deg` }],
                  borderTopColor: getStateColor(timerState),
                },
              ]}
            />
          )}
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.sessionText}>Session {currentSession}</Text>
            <Text style={styles.tapHint}>Tap to adjust time</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={resetTimer} style={styles.controlButton}>
          <RotateCcw size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleTimer} style={styles.playButton}>
          {isRunning ? (
            <Pause size={32} color={colors.background} />
          ) : (
            <Play size={32} color={colors.background} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setTimerState(timerState === 'work' ? 'shortBreak' : 'work');
            resetTimer();
          }}
          style={styles.controlButton}
        >
          <Coffee size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAdjustModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Timer</Text>
              <TouchableOpacity 
                onPress={() => setShowAdjustModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hours</Text>
                <ScrollView 
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                >
                  {generateNumbers(0, 23).map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.pickerItem,
                        selectedHours === num && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedHours(num)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedHours === num && styles.selectedPickerItemText,
                      ]}>
                        {num.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minutes</Text>
                <ScrollView 
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                >
                  {generateNumbers(0, 59).map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.pickerItem,
                        selectedMinutes === num && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedMinutes(num)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedMinutes === num && styles.selectedPickerItemText,
                      ]}>
                        {num.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text style={styles.selectedTime}>
              {selectedHours.toString().padStart(2, '0')}:
              {selectedMinutes.toString().padStart(2, '0')}
            </Text>

            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleAdjustTime}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
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
    padding: 16,
    marginBottom: 16,
  },
  timerStatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  stateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
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
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    position: 'absolute',
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressArc: {
    position: 'absolute',
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 48,
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
    backgroundColor: colors.cardBackground,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  pickerLabel: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  picker: {
    height: 200,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 20,
    color: colors.text,
  },
  selectedPickerItemText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  selectedTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});