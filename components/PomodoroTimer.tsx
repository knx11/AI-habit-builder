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
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Play, Pause, RotateCcw, Coffee, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import * as Haptics from 'expo-haptics';

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
  const hoursScrollViewRef = useRef<ScrollView>(null);
  const minutesScrollViewRef = useRef<ScrollView>(null);
  
  const { width } = Dimensions.get('window');
  const circleSize = width * 0.6;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
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
  
  // Format seconds to hh:mm:ss
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
  
  // Update progress animation when timeLeft changes
  useEffect(() => {
    const duration = getCurrentDuration();
    const progress = 1 - (timeLeft / duration);
    
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);
  
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
    
    // Schedule scrolling to the selected values after the modal is visible
    setTimeout(() => {
      if (hoursScrollViewRef.current) {
        hoursScrollViewRef.current.scrollTo({ 
          y: selectedHours * 50, 
          animated: false 
        });
      }
      if (minutesScrollViewRef.current) {
        minutesScrollViewRef.current.scrollTo({ 
          y: selectedMinutes * 50, 
          animated: false 
        });
      }
    }, 100);
  };
  
  const applySelectedTime = () => {
    const newTimeInSeconds = (selectedHours * 3600) + (selectedMinutes * 60);
    setTimeLeft(newTimeInSeconds > 0 ? newTimeInSeconds : 60); // Minimum 1 minute
    setShowTimePicker(false);
  };
  
  const handleHourScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const hour = Math.round(offsetY / 50);
    if (hour >= 0 && hour <= 23) {
      setSelectedHours(hour);
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };
  
  const handleMinuteScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const minute = Math.round(offsetY / 50);
    if (minute >= 0 && minute <= 59) {
      setSelectedMinutes(minute);
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };
  
  // Generate hours and minutes for the picker
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  
  // Calculate progress percentage for the circle
  const progressStrokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [2 * Math.PI * (circleSize / 2 - 10), 0],
  });
  
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
          <Animated.View
            style={[
              styles.progressCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
                borderColor: colors.primary,
                transform: [{ rotate: '-90deg' }],
              }
            ]}
          >
            <Animated.View
              style={[
                styles.progressArc,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  borderColor: colors.primary,
                  strokeDashoffset: progressStrokeDashoffset,
                }
              ]}
            />
          </Animated.View>
          
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
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hours</Text>
                <View style={styles.pickerWrapper}>
                  <ScrollView
                    ref={hoursScrollViewRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={50}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleHourScroll}
                    contentContainerStyle={styles.pickerScrollContent}
                  >
                    {/* Add empty items at the beginning for padding */}
                    <View style={styles.pickerItem} />
                    <View style={styles.pickerItem} />
                    
                    {hours.map((hour) => (
                      <View key={`hour-${hour}`} style={styles.pickerItem}>
                        <Text 
                          style={[
                            styles.pickerItemText,
                            selectedHours === hour && styles.selectedPickerItemText
                          ]}
                        >
                          {hour}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Add empty items at the end for padding */}
                    <View style={styles.pickerItem} />
                    <View style={styles.pickerItem} />
                  </ScrollView>
                  <View style={styles.pickerHighlight} />
                </View>
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minutes</Text>
                <View style={styles.pickerWrapper}>
                  <ScrollView
                    ref={minutesScrollViewRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={50}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleMinuteScroll}
                    contentContainerStyle={styles.pickerScrollContent}
                  >
                    {/* Add empty items at the beginning for padding */}
                    <View style={styles.pickerItem} />
                    <View style={styles.pickerItem} />
                    
                    {minutes.map((minute) => (
                      <View key={`minute-${minute}`} style={styles.pickerItem}>
                        <Text 
                          style={[
                            styles.pickerItemText,
                            selectedMinutes === minute && styles.selectedPickerItemText
                          ]}
                        >
                          {minute}
                        </Text>
                      </View>
                    ))}
                    
                    {/* Add empty items at the end for padding */}
                    <View style={styles.pickerItem} />
                    <View style={styles.pickerItem} />
                  </ScrollView>
                  <View style={styles.pickerHighlight} />
                </View>
              </View>
            </View>
            
            <View style={styles.timePreview}>
              <Text style={styles.timePreviewText}>
                {`${selectedHours}:${selectedMinutes.toString().padStart(2, '0')}`}
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    borderWidth: 10,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  progressArc: {
    position: 'absolute',
    borderWidth: 10,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerInner: {
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
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
    width: '45%',
  },
  pickerLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
    fontWeight: '500',
  },
  pickerWrapper: {
    height: 150,
    position: 'relative',
    width: '100%',
  },
  pickerScrollContent: {
    paddingVertical: 0,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 20,
    color: colors.textLight,
  },
  selectedPickerItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  pickerHighlight: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    width: '100%',
    height: 50,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.03)',
    pointerEvents: 'none',
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