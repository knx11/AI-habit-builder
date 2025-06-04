import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { X, Play, Pause, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';

interface PomodoroTimerProps {
  taskId?: string;
}

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { pomodoroSettings } = useTaskStore();
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // in seconds
  const [timerMode, setTimerMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Initialize timer with pomodoro settings
    if (timerMode === 'work') {
      setTimeRemaining(pomodoroSettings.workDuration * 60);
    } else if (timerMode === 'shortBreak') {
      setTimeRemaining(pomodoroSettings.shortBreakDuration * 60);
    } else {
      setTimeRemaining(pomodoroSettings.longBreakDuration * 60);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerMode, pomodoroSettings]);
  
  const startTimer = () => {
    if (isRunning) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const pauseTimer = () => {
    if (!isRunning) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const resetTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    pauseTimer();
    
    if (timerMode === 'work') {
      setTimeRemaining(pomodoroSettings.workDuration * 60);
    } else if (timerMode === 'shortBreak') {
      setTimeRemaining(pomodoroSettings.shortBreakDuration * 60);
    } else {
      setTimeRemaining(pomodoroSettings.longBreakDuration * 60);
    }
  };
  
  const handleTimerComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    pauseTimer();
    
    if (timerMode === 'work') {
      setSessionsCompleted(prev => prev + 1);
      
      if (sessionsCompleted + 1 >= pomodoroSettings.sessionsBeforeLongBreak) {
        setTimerMode('longBreak');
        setTimeRemaining(pomodoroSettings.longBreakDuration * 60);
        setSessionsCompleted(0);
      } else {
        setTimerMode('shortBreak');
        setTimeRemaining(pomodoroSettings.shortBreakDuration * 60);
      }
    } else {
      setTimerMode('work');
      setTimeRemaining(pomodoroSettings.workDuration * 60);
    }
  };
  
  const handleAdjustTime = () => {
    // Convert hours and minutes to seconds
    const totalSeconds = (selectedHours * 60 * 60) + (selectedMinutes * 60);
    setTimeRemaining(totalSeconds);
    setShowAdjustModal(false);
    
    // Reset the timer state
    pauseTimer();
    setTimerMode('work');
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Text style={styles.timerLabel}>
            {timerMode === 'work' ? 'Work Session' : 
             timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </Text>
          <Text style={styles.sessionCounter}>
            Session {sessionsCompleted + 1}/{pomodoroSettings.sessionsBeforeLongBreak}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.timeDisplay}
          onPress={() => setShowAdjustModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
        </TouchableOpacity>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetTimer}
          >
            <RotateCcw size={24} color={colors.text} />
          </TouchableOpacity>
          
          {isRunning ? (
            <TouchableOpacity 
              style={[styles.controlButton, styles.pauseButton]}
              onPress={pauseTimer}
            >
              <Pause size={28} color={colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlButton, styles.playButton]}
              onPress={startTimer}
            >
              <Play size={28} color={colors.background} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Time Adjustment Modal */}
      <Modal
        visible={showAdjustModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAdjustModal(false)}
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
                  contentContainerStyle={styles.pickerContent}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  <View style={styles.pickerPadding} />
                  {Array.from({ length: 24 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.pickerItem,
                        selectedHours === i && styles.selectedPickerItem,
                      ]}
                      onPress={() => {
                        setSelectedHours(i);
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedHours === i && styles.selectedPickerItemText,
                        { opacity: Math.abs(selectedHours - i) <= 2 ? 1 - Math.abs(selectedHours - i) * 0.3 : 0.1 }
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={styles.pickerPadding} />
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minutes</Text>
                <ScrollView 
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerContent}
                  snapToInterval={44}
                  decelerationRate="fast"
                >
                  <View style={styles.pickerPadding} />
                  {Array.from({ length: 60 }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.pickerItem,
                        selectedMinutes === i && styles.selectedPickerItem,
                      ]}
                      onPress={() => {
                        setSelectedMinutes(i);
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        selectedMinutes === i && styles.selectedPickerItemText,
                        { opacity: Math.abs(selectedMinutes - i) <= 2 ? 1 - Math.abs(selectedMinutes - i) * 0.3 : 0.1 }
                      ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={styles.pickerPadding} />
                </ScrollView>
              </View>
            </View>

            <Text style={styles.selectedTime}>
              {selectedHours === 0 
                ? `${selectedMinutes} MINUTES`
                : `${selectedHours}:${selectedMinutes.toString().padStart(2, '0')}`
              }
            </Text>

            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleAdjustTime}
              activeOpacity={0.8}
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
    flex: 1,
  },
  timerCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sessionCounter: {
    fontSize: 14,
    color: colors.textLight,
  },
  timeDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  resetButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  pauseButton: {
    backgroundColor: colors.primary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '85%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    padding: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 160,
    marginBottom: 24,
  },
  pickerColumn: {
    width: 100,
    height: '100%',
    marginHorizontal: 12,
  },
  pickerLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
  },
  pickerContent: {
    paddingVertical: 60,
  },
  pickerPadding: {
    height: 60,
  },
  pickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  selectedPickerItem: {
    backgroundColor: 'rgba(21, 55, 46, 0.1)',
    borderRadius: 10,
  },
  pickerItemText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#C0C0C0',
  },
  selectedPickerItemText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#15372E',
  },
  selectedTime: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#15372E',
    borderRadius: 12,
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});