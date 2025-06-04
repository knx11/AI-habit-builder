import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  AppState, 
  AppStateStatus,
  Modal,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Play, Pause, RotateCcw, Coffee, X } from 'lucide-react-native';
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

// Preset durations (in minutes)
const PRESET_DURATIONS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4
};

export default function PomodoroTimer({ taskId, subTaskId, onComplete }: PomodoroTimerProps) {
  const { pomodoroSettings } = useTaskStore();
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [timeLeft, setTimeLeft] = useState(PRESET_DURATIONS.work * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHours, setSelectedHours] = useState(Math.floor(timeLeft / 3600));
  const [selectedMinutes, setSelectedMinutes] = useState(Math.floor((timeLeft % 3600) / 60));
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);
  
  const { width } = Dimensions.get('window');
  const dialSize = width * 0.8;
  const hoursAngle = useRef(new Animated.Value(0)).current;
  const minutesAngle = useRef(new Animated.Value(0)).current;
  
  // Get the current timer duration based on state
  const getCurrentDuration = () => {
    switch (timerState) {
      case 'work':
        return PRESET_DURATIONS.work * 60;
      case 'shortBreak':
        return PRESET_DURATIONS.shortBreak * 60;
      case 'longBreak':
        return PRESET_DURATIONS.longBreak * 60;
    }
  };
  
  // Format seconds to hh:mm
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}:00`;
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
  }, [timerState]);
  
  const handleTimerComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (timerState === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      
      if (newSessions % PRESET_DURATIONS.sessionsBeforeLongBreak === 0) {
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
  
  const openTimePicker = () => {
    if (isActive) return; // Don't allow changing time while timer is running
    
    setSelectedHours(Math.floor(timeLeft / 3600));
    setSelectedMinutes(Math.floor((timeLeft % 3600) / 60));
    setShowTimePicker(true);
    
    // Set initial angles for the dials
    hoursAngle.setValue((Math.floor(timeLeft / 3600) / 12) * 360);
    minutesAngle.setValue((Math.floor((timeLeft % 3600) / 60) / 60) * 360);
  };
  
  const applySelectedTime = () => {
    const newTimeInSeconds = (selectedHours * 3600) + (selectedMinutes * 60);
    setTimeLeft(newTimeInSeconds > 0 ? newTimeInSeconds : 60); // Minimum 1 minute
    setShowTimePicker(false);
  };
  
  // Create pan responder for hours dial
  const hoursPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { moveX, moveY, x0, y0 } = gestureState;
        const centerX = x0;
        const centerY = y0;
        
        // Calculate angle from center to touch point
        const angle = Math.atan2(moveY - centerY, moveX - centerX) * (180 / Math.PI);
        const normalizedAngle = (angle + 360) % 360;
        
        // Convert angle to hours (0-11)
        const hours = Math.round((normalizedAngle / 360) * 12);
        setSelectedHours(hours);
        hoursAngle.setValue(normalizedAngle);
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    })
  ).current;
  
  // Create pan responder for minutes dial
  const minutesPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const { moveX, moveY, x0, y0 } = gestureState;
        const centerX = x0;
        const centerY = y0;
        
        // Calculate angle from center to touch point
        const angle = Math.atan2(moveY - centerY, moveX - centerX) * (180 / Math.PI);
        const normalizedAngle = (angle + 360) % 360;
        
        // Convert angle to minutes (0-59)
        const minutes = Math.round((normalizedAngle / 360) * 60);
        setSelectedMinutes(minutes);
        minutesAngle.setValue(normalizedAngle);
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    })
  ).current;
  
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
        <TouchableOpacity 
          style={styles.timerCircle}
          onPress={openTimePicker}
          disabled={isActive}
        >
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
            {!isActive && (
              <Text style={styles.tapHint}>Tap to adjust</Text>
            )}
          </View>
        </TouchableOpacity>
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
      
      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Timer</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.dialContainer}>
                <Text style={styles.dialLabel}>Hours</Text>
                <View 
                  style={styles.dial}
                  {...hoursPanResponder.panHandlers}
                >
                  <Animated.View
                    style={[
                      styles.dialHand,
                      {
                        transform: [
                          { rotate: hoursAngle.interpolate({
                              inputRange: [0, 360],
                              outputRange: ['0deg', '360deg']
                            })
                          }
                        ]
                      }
                    ]}
                  />
                  <View style={styles.dialCenter} />
                  <Text style={styles.dialValue}>{selectedHours}</Text>
                </View>
              </View>
              
              <View style={styles.dialContainer}>
                <Text style={styles.dialLabel}>Minutes</Text>
                <View 
                  style={styles.dial}
                  {...minutesPanResponder.panHandlers}
                >
                  <Animated.View
                    style={[
                      styles.dialHand,
                      {
                        transform: [
                          { rotate: minutesAngle.interpolate({
                              inputRange: [0, 360],
                              outputRange: ['0deg', '360deg']
                            })
                          }
                        ]
                      }
                    ]}
                  />
                  <View style={styles.dialCenter} />
                  <Text style={styles.dialValue}>{selectedMinutes}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.timePreview}>
              <Text style={styles.timePreviewText}>
                {selectedHours > 0 ? `${selectedHours}:${selectedMinutes.toString().padStart(2, '0')}` : `${selectedMinutes}:00`}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applySelectedTime}
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
  tapHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
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
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dialContainer: {
    alignItems: 'center',
  },
  dialLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  dial: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dialHand: {
    position: 'absolute',
    width: 2,
    height: 50,
    backgroundColor: colors.primary,
    bottom: 60,
    left: 59,
    transformOrigin: 'bottom',
  },
  dialCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  dialValue: {
    position: 'absolute',
    bottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  timePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timePreviewText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});